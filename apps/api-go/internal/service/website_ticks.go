package service

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
)

type WebsiteTicksService struct {
	repo        repository.WebsiteTicksRepository
	websiteRepo repository.WebsiteRepository
}

func NewWebsiteTicksService(
	repo repository.WebsiteTicksRepository,
	websiteRepo repository.WebsiteRepository,
) *WebsiteTicksService {
	return &WebsiteTicksService{
		repo:        repo,
		websiteRepo: websiteRepo,
	}
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

func (s *WebsiteTicksService) GetWebsiteChecks(
	ctx context.Context,
	userID string,
	websiteID string,
	limit int,
) ([]domain.WebsiteTicks, error) {
	if limit <= 0 {
		limit = 20
	}

	// 1. Get website
	website, err := s.websiteRepo.GetByID(ctx, websiteID)
	if err != nil {
		return nil, err
	}

	// 2. Check user ownership
	if website.UserID != userID {
		return nil, domain.ErrForbidden
	}

	// 3. Fetch Ticks
	ticks, err := s.repo.ListByWebsiteID(ctx, websiteID, limit)
	if err != nil {
		return nil, err
	}

	return ticks, nil
}
