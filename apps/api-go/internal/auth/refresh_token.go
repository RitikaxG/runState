package auth

import (
	"crypto/rand"
	"encoding/base64"
)

func GenerateRefreshToken() (string, error) {
	// Creates a byte slice of 32 bytes
	b := make([]byte, 32)
	// Fill with cryptographically secure randomness
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	// Encode bytes into URL-safe string
	return base64.RawURLEncoding.EncodeToString(b), nil
}
