package repository

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/jmoiron/sqlx"
)

type notificationLogRepository struct {
	db *sqlx.DB
}

func NewNotificationLogRepository(db *sqlx.DB) NotificationLogRepository {
	return &notificationLogRepository{db: db}
}

func (r *notificationLogRepository) Create(ctx context.Context, log *domain.NotificationLog) error {
	query := `
		INSERT INTO notification_logs (
			website_id,
			incident_id,
			region_id,
			channel,
			recipient,
			prev_status,
			current_status,
			delivery_status,
			provider_message_id,
			sent_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		log.WebsiteID,
		log.IncidentID,
		log.RegionID,
		log.Channel,
		log.Recipient,
		log.PrevStatus,
		log.CurrentStatus,
		log.DeliveryStatus,
		log.ProviderMessageID,
		log.SentAt,
	).Scan(&log.ID, &log.CreatedAt)
}

func (r *notificationLogRepository) ListByWebsiteID(ctx context.Context, websiteID string, limit int) ([]domain.NotificationLog, error) {
	query := `
		SELECT
			id,
			website_id,
			incident_id,
			region_id,
			channel,
			recipient,
			prev_status,
			current_status,
			delivery_status,
			provider_message_id,
			sent_at,
			created_at
		FROM notification_logs
		WHERE website_id = $1
		ORDER BY sent_at DESC
		LIMIT $2
	`

	rows, err := r.db.QueryContext(ctx, query, websiteID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []domain.NotificationLog
	for rows.Next() {
		var item domain.NotificationLog
		if err := rows.Scan(
			&item.ID,
			&item.WebsiteID,
			&item.IncidentID,
			&item.RegionID,
			&item.Channel,
			&item.Recipient,
			&item.PrevStatus,
			&item.CurrentStatus,
			&item.DeliveryStatus,
			&item.ProviderMessageID,
			&item.SentAt,
			&item.CreatedAt,
		); err != nil {
			return nil, err
		}
		logs = append(logs, item)
	}

	return logs, rows.Err()
}
