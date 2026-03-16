package repository

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

// APPEND ONLY TABLE
type WebsiteTicksRepository interface {
	Create(ctx context.Context, websiteTicks *domain.WebsiteTicks) error
	ListByWebsiteID(ctx context.Context, websiteID string, limit int) ([]domain.WebsiteTicks, error)
	GetLatestByWebsiteIDs(ctx context.Context, websiteIDs []string) (map[string]domain.WebsiteTicks, error)
}
