package auth

import (
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/golang-jwt/jwt/v5"
)

/*
JWT Library is used to :
 1. Create tokens
 2. Sign tokens
 3. Parse & Validate tokens

Claims defines the JWT payload.
A JWT has 3 parts:
 1. Header
 2. Payload (claims)
 3. Signature

This struct defines what goes inside the payload.
*/
type Claims struct {
	// Custom claim: identifies the authenticated user
	UserId string `json:"user_id"`

	/*
		Embedded standard JWT claims.
		Includes:
		  - exp (expiry)
		  - iat (issued at)
		  - nbf (not before)
		  - iss (issuer)
	*/
	Role domain.Role `json:"role"`
	jwt.RegisteredClaims
}

/*
JWTManager is responsible for:
  - Generating JWTs
  - Validating JWTs

It encapsulates:
  - Secret key
  - Token expiry duration
*/
type JWTManager struct {
	secret []byte
	ttl    time.Duration
}

/*
NewJWTManager constructs a JWTManager safely.
This avoids passing secret & TTL everywhere.
*/
func NewJWTManager(secret string, ttl time.Duration) *JWTManager {
	return &JWTManager{
		secret: []byte(secret),
		ttl:    ttl,
	}
}

/*
GenerateToken creates and signs a JWT for an authenticated user.

Input:
  - userID: authenticated user's ID

Output:
  - Signed JWT string
*/
func (j *JWTManager) GenerateAccessToken(userID string, role domain.Role) (string, error) {
	// Create claims payload
	claims := &Claims{
		UserId: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(j.ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	// Create JWT using HS256 signing algorithm
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign token using secret key
	return token.SignedString(j.secret)
}

/*
ValidateToken parses and validates a JWT.

Input:
  - tokenStr: JWT string from Authorization header

Returns:
  - Parsed *Claims if token is valid
  - Error if token is invalid
*/
func (j *JWTManager) ValidateToken(tokenStr string) (*Claims, error) {
	/*
		- Parses the JWT
		- Verifies the signature
		- Decode payload into claims struct
		- Returns : token - parsed JWT object, err : error if signature, expiry or format is wrong
	*/
	token, err := jwt.ParseWithClaims(
		tokenStr,
		&Claims{}, // empty claims struct to be filled
		func(t *jwt.Token) (interface{}, error) {
			/*
				Ensure token was signed using HMAC (HS256).
				This prevents algorithm substitution attacks.
			*/
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, domain.ErrInvalidAuthFormat
			}

			// Return secret key for signature verification
			return j.secret, nil
		},
	)
	if err != nil {
		return nil, err
	}

	// Safely extract claims from token
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, domain.ErrInvalidAuthFormat
	}

	return claims, nil
}
