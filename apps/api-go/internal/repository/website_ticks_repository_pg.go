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
