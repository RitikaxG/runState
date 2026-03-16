package service

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/dto"
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
	role string,
	websiteID string,
	limit int,
) ([]domain.WebsiteTicks, error) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	website, err := s.websiteRepo.GetByID(ctx, websiteID)
	if err != nil {
		return nil, err
	}

	if role != "ADMIN" && website.UserID != userID {
		return nil, domain.ErrForbidden
	}

	ticks, err := s.repo.ListByWebsiteID(ctx, websiteID, limit)
	if err != nil {
		return nil, err
	}

	return ticks, nil
}

func (s *WebsiteTicksService) ListWebsitesForUser(
	ctx context.Context,
	userID string,
	role string,
) ([]dto.WebsiteListItem, error) {
	websites, err := s.websiteRepo.ListAllWebsites(ctx)
	if err != nil {
		return nil, err
	}

	filtered := make([]domain.Website, 0, len(websites))
	for _, website := range websites {
		if role == "ADMIN" || website.UserID == userID {
			filtered = append(filtered, website)
		}
	}

	websiteIDs := make([]string, 0, len(filtered))
	for _, website := range filtered {
		websiteIDs = append(websiteIDs, website.ID)
	}

	latestTicks, err := s.repo.GetLatestByWebsiteIDs(ctx, websiteIDs)
	if err != nil {
		return nil, err
	}

	items := make([]dto.WebsiteListItem, 0, len(filtered))
	for _, website := range filtered {
		item := dto.WebsiteListItem{
			ID:            website.ID,
			URL:           website.URL,
			CurrentStatus: string(*website.CurrentStatus),
			TimeAdded:     website.TimeAdded,
		}

		if tick, ok := latestTicks[website.ID]; ok {
			item.LastCheckedAt = &tick.CreatedAt

			responseTime := tick.ResponseTimeMs
			item.LatestResponseTimeMs = &responseTime

			if tick.Status != "" {
				item.CurrentStatus = string(tick.Status)
			}
		}

		items = append(items, item)
	}

	return items, nil
}
