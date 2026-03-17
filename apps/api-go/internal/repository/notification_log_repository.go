package repository

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

type NotificationLogRepository interface {
	Create(ctx context.Context, log *domain.NotificationLog) error
	ListByWebsiteID(ctx context.Context, websiteID string, limit int) ([]domain.NotificationLog, error)
}
