package repository

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/jmoiron/sqlx"
)

type websiteTicksRepository struct {
	db *sqlx.DB
}

func NewWebsiteTicksRepository(db *sqlx.DB) WebsiteTicksRepository {
	return &websiteTicksRepository{db: db}
}

func (r *websiteTicksRepository) Create(
	ctx context.Context,
	websiteTicks *domain.WebsiteTicks,
) error {
	query := `
	INSERT INTO website_ticks (status, response_time_ms, website_id, region_id )
	VALUES ($1, $2, $3, $4)
	RETURNING id
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		websiteTicks.Status,
		websiteTicks.ResponseTimeMs,
		websiteTicks.WebsiteID,
		websiteTicks.RegionID,
	)

	if err != nil {
		return err
	}

	return nil
}

func (r *websiteTicksRepository) ListByWebsiteID(
	ctx context.Context,
	websiteID string,
	limit int,
) ([]domain.WebsiteTicks, error) {
	query := `
		SELECT id, website_id, region_id, status, response_time_ms, created_at
		FROM website_ticks
		WHERE website_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`

	var ticks []domain.WebsiteTicks
	err := r.db.SelectContext(ctx, &ticks, query, websiteID, limit)
	if err != nil {
		return nil, err
	}

	return ticks, nil
}

func (r *websiteTicksRepository) GetLatestByWebsiteIDs(
	ctx context.Context,
	websiteIDs []string,
) (map[string]domain.WebsiteTicks, error) {
	result := make(map[string]domain.WebsiteTicks)

	if len(websiteIDs) == 0 {
		return result, nil
	}

	query, args, err := sqlx.In(`
		SELECT DISTINCT ON (website_id)
			id,
			website_id,
			status,
			response_time_ms,
			created_at,
			region_id
		FROM website_ticks
		WHERE website_id IN (?)
		ORDER BY website_id, created_at DESC
	`, websiteIDs)

	if err != nil {
		return nil, err
	}

	query = r.db.Rebind(query)
	var ticks []domain.WebsiteTicks

	if err := r.db.SelectContext(ctx, &ticks, query, args...); err != nil {
		return nil, err
	}

	for _, tick := range ticks {
		result[tick.WebsiteID] = tick
	}

	return result, nil
}
