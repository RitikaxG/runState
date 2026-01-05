package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/auth"
	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
)

/*
UserService : Identity & Credentials
AuthService : tokens & sessions

Signin in AuthService issues credentials & not validate token
*/
type AuthService struct {
	userRepo    repository.UserRepository
	refreshRepo repository.RefreshTokenRepository
	jwtManager  *auth.JWTManager
}

func NewAuthService(
	userRepo repository.UserRepository,
	refreshRepo repository.RefreshTokenRepository,
	jwtManager *auth.JWTManager,
) *AuthService {
	return &AuthService{
		userRepo:    userRepo,
		refreshRepo: refreshRepo,
		jwtManager:  jwtManager,
	}
}

func (s *AuthService) Signin(
	ctx context.Context,
	user *domain.User,
) (*auth.TokenPair, error) {

	// 1. Generate Access Token
	accessToken, err := s.jwtManager.GenerateAccessToken(
		user.ID,
		user.Role,
	)

	if err != nil {
		return nil, err
	}

	// 2. Generate refresh Token ( RAW )
	rawRefreshToken, err := auth.GenerateRefreshToken()

	if err != nil {
		return nil, err
	}

	/*
		It converts the refresh token string into bytes and computes a SHA-256
		cryptographic hash, producing a fixed-length, irreversible fingerprint
		of the token.
	*/

	// 3. Hash Refresh Token
	hash := sha256.Sum256([]byte(rawRefreshToken))

	// 4. Create domain Refresh Token
	refreshToken := &domain.RefreshToken{
		UserID: user.ID,
		/*
			It converts a 32-byte SHA-256 hash into a human-readable hexadecimal
			string so it can be safely stored and compared as text (in database).
		*/
		TokenHash: hex.EncodeToString(hash[:]),
		ExpiresAt: time.Now().Add(14 * 24 * time.Hour),
		Revoked:   false,
	}

	if err := s.refreshRepo.Create(
		ctx,
		refreshToken,
	); err != nil {
		return nil, err
	}

	return &auth.TokenPair{
		AccessToken:  accessToken,
		RefreshToken: rawRefreshToken,
	}, nil
}

func (s *AuthService) Refresh(
	ctx context.Context,
	rawRefreshToken string,
) (*auth.TokenPair, error) {

	// 1. Hash incoming refresh token
	hash := sha256.Sum256([]byte(rawRefreshToken))
	hashedToken := hex.EncodeToString(hash[:])

	// 2. Validate refesh token
	userID, err := s.refreshRepo.FindValid(ctx, hashedToken)
	if err != nil {
		return nil, domain.ErrInvalidRefreshToken
	}

	// 3. Revoke old token ( Rotation )
	err = s.refreshRepo.Revoke(ctx, hashedToken)
	if err != nil {
		return nil, err
	}

	// 4. Fetch user
	user, err := s.userRepo.GetById(ctx, userID)
	if err != nil {
		return nil, err
	}

	// 5. Generate new access token
	accessToken, err := s.jwtManager.GenerateAccessToken(
		user.ID,
		user.Role,
	)

	if err != nil {
		return nil, err
	}

	// 6. Generate new refresh token
	newRawRefreshToken, err := auth.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	// 7. Store new Refresh Token
	hash = sha256.Sum256([]byte(newRawRefreshToken))
	newRefresh := &domain.RefreshToken{
		UserID:    user.ID,
		TokenHash: hex.EncodeToString(hash[:]),
		ExpiresAt: time.Now().Add(14 * 24 * time.Hour),
		Revoked:   false,
	}

	if err := s.refreshRepo.Create(ctx, newRefresh); err != nil {
		return nil, err
	}

	// 8. Return New Tokens
	return &auth.TokenPair{
		AccessToken:  accessToken,
		RefreshToken: newRawRefreshToken,
	}, nil

}

func (s *AuthService) Logout(
	ctx context.Context,
	rawRefreshToken string,
) error {
	hash := sha256.Sum256([]byte(rawRefreshToken))
	hashedToken := hex.EncodeToString(hash[:])

	return s.refreshRepo.Revoke(ctx, hashedToken)
}
