package service

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/dto"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
)

type PublicStatusService struct {
	websiteRepo repository.WebsiteRepository
}

func NewPublicStatusService(
	websiteRepo repository.WebsiteRepository,
) *PublicStatusService {
	return &PublicStatusService{
		websiteRepo: websiteRepo,
	}
}

func (s *PublicStatusService) GetStatusPageBySlug(
	ctx context.Context,
	slug string,
) (*dto.PublicStatusPageData, error) {
	website, err := s.websiteRepo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}

	currentStatus := "unknown"
	if website.CurrentStatus != nil {
		currentStatus = string(*website.CurrentStatus)
	}

	return &dto.PublicStatusPageData{
		Website: dto.PublicWebsiteSummary{
			ID:            website.ID,
			URL:           website.URL,
			Slug:          website.Slug,
			CurrentStatus: currentStatus,
			TimeAdded:     website.TimeAdded,
		},
	}, nil
}
