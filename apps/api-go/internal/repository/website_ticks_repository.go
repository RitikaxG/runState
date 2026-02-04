package repository

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

// APPEND ONLY TABLE
type WebsiteTicksRepository interface {
	Create(ctx context.Context, websiteTicks *domain.WebsiteTicks) error
}
