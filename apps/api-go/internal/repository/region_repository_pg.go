package repository

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type regionRepository struct {
	db *sqlx.DB
}

func NewRegionRepository(db *sqlx.DB) RegionRepository {
	return &regionRepository{db: db}
}

func (r *regionRepository) GetRegionIDByName(
	ctx context.Context,
	name string,
) (string, error) {
	var regionID string
	query := `
	SELECT id FROM region
	WHERE name = $1
	`
	err := r.db.QueryRowxContext(ctx, query, name).Scan(&regionID)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", err // let caller decide retry vs crash
		}
		return "", err
	}
	return regionID, nil
}
