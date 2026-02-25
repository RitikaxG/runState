package repository

import "context"

type RegionRepository interface {
	GetRegionIDByName(ctx context.Context, name string) (string, error)
}
