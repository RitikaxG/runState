package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/jmoiron/sqlx"
)

type incidentRepository struct {
	db *sqlx.DB
}

func NewIncidentRepository(db *sqlx.DB) IncidentRepository {
	return &incidentRepository{db: db}
}

func (r *incidentRepository) Create(ctx context.Context, incident *domain.Incident) error {
	query := `
		INSERT INTO incidents (
			website_id,
			region_id,
			started_at,
			current_status,
			is_active
		) VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		incident.WebsiteID,
		incident.RegionID,
		incident.StartedAt,
		incident.CurrentStatus,
		incident.IsActive,
	).Scan(&incident.ID, &incident.CreatedAt)
}

func (r *incidentRepository) GetActiveByWebsiteAndRegion(ctx context.Context, websiteID string, regionID *string) (*domain.Incident, error) {
	query := `
		SELECT
			id,
			website_id,
			region_id,
			started_at,
			resolved_at,
			current_status,
			is_active,
			created_at
		FROM incidents
		WHERE website_id = $1
		  AND is_active = TRUE
		  AND (
		        ($2::uuid IS NULL AND region_id IS NULL)
		        OR region_id = $2
		      )
		ORDER BY started_at DESC
		LIMIT 1
	`

	var incident domain.Incident
	err := r.db.QueryRowContext(ctx, query, websiteID, regionID).Scan(
		&incident.ID,
		&incident.WebsiteID,
		&incident.RegionID,
		&incident.StartedAt,
		&incident.ResolvedAt,
		&incident.CurrentStatus,
		&incident.IsActive,
		&incident.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &incident, nil
}

func (r *incidentRepository) Resolve(ctx context.Context, incidentID string, resolvedAt time.Time, currentStatus domain.WebsiteStatus) error {
	query := `
		UPDATE incidents
		SET resolved_at = $2,
		    current_status = $3,
		    is_active = FALSE
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query, incidentID, resolvedAt, currentStatus)
	return err
}

func (r *incidentRepository) ListByWebsiteID(ctx context.Context, websiteID string, limit int) ([]domain.Incident, error) {
	query := `
		SELECT
			id,
			website_id,
			region_id,
			started_at,
			resolved_at,
			current_status,
			is_active,
			created_at
		FROM incidents
		WHERE website_id = $1
		ORDER BY started_at DESC
		LIMIT $2
	`

	rows, err := r.db.QueryContext(ctx, query, websiteID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var incidents []domain.Incident
	for rows.Next() {
		var incident domain.Incident
		if err := rows.Scan(
			&incident.ID,
			&incident.WebsiteID,
			&incident.RegionID,
			&incident.StartedAt,
			&incident.ResolvedAt,
			&incident.CurrentStatus,
			&incident.IsActive,
			&incident.CreatedAt,
		); err != nil {
			return nil, err
		}
		incidents = append(incidents, incident)
	}

	return incidents, rows.Err()
}
