package repository

import (
	"context"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

type IncidentRepository interface {
	Create(ctx context.Context, incident *domain.Incident) error
	GetActiveByWebsiteAndRegion(ctx context.Context, websiteID string, regionID *string) (*domain.Incident, error)
	Resolve(ctx context.Context, incidentID string, resolvedAt time.Time, currentStatus domain.WebsiteStatus) error
	ListByWebsiteID(ctx context.Context, websiteID string, limit int) ([]domain.Incident, error)
}
