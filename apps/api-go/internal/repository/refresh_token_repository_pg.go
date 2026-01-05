package repository

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/jmoiron/sqlx"
)

type refreshTokenRepository struct {
	db *sqlx.DB
}

func NewRefreshTokenRepository(db *sqlx.DB) RefreshTokenRepository {
	return &refreshTokenRepository{db: db}
}

// Save Refresh Token
func (r *refreshTokenRepository) Create(
	ctx context.Context,
	t *domain.RefreshToken,
) error {

	query := `
	INSERT into refresh_tokens (user_id, token_hash, expires_at)
	VALUES ($1,$2,$3)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		t.UserID,

		t.TokenHash,
		t.ExpiresAt,
	)
	return err
}

// Find Valid Refresh Token
func (r *refreshTokenRepository) FindValid(
	ctx context.Context,
	tokenHash string,
) (string, error) {

	var userID string

	query := `
	SELECT user_id FROM refresh_tokens
	WHERE token_hash = $1
	AND revoked = false
	AND expires_at > now()
	`

	err := r.db.GetContext(
		ctx,
		&userID,
		query,
		tokenHash,
	)
	return userID, err
}

// Revoke Refresh Token ( Rotation )
func (r *refreshTokenRepository) Revoke(
	ctx context.Context,
	tokenHash string,
) error {

	_, err := r.db.ExecContext(
		ctx,
		`UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1 AND revoked = false`,
		tokenHash,
	)
	return err
}
