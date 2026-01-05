package repository

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

type RefreshTokenRepository interface {
	Create(
		ctx context.Context,
		t *domain.RefreshToken,
	) error

	FindValid(
		ctx context.Context,
		tokenHash string,
	) (string, error)

	Revoke(
		ctx context.Context,
		tokenHash string,
	) error
}
