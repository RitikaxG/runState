package service

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
)

type WebsiteTicksService struct {
	repo repository.WebsiteTicksRepository
}

func NewWebsiteTicksService(repo repository.WebsiteTicksRepository) *WebsiteTicksService {
	return &WebsiteTicksService{repo: repo}
}

func (s *WebsiteTicksService) CreateWebsiteTicks(
	ctx context.Context,
	status domain.WebsiteStatus,
	responseTimeMs int64,
	websiteId string,
	regionId string,
) (*domain.WebsiteTicks, error) {

	if status == domain.WebsiteDown {
		responseTimeMs = 0
	}

	websiteTicks := &domain.WebsiteTicks{
		Status:         status,
		ResponseTimeMs: responseTimeMs,
		WebsiteID:      websiteId,
		RegionID:       regionId,
	}

	if err := s.repo.Create(ctx, websiteTicks); err != nil {
		return nil, err
	}

	return websiteTicks, nil
}
