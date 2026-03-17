package service

import (
	"context"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/dto"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
)

type IncidentService struct {
	incidentRepo repository.IncidentRepository
	websiteRepo  repository.WebsiteRepository
}

func NewIncidentService(
	incidentRepo repository.IncidentRepository,
	websiteRepo repository.WebsiteRepository,
) *IncidentService {
	return &IncidentService{
		incidentRepo: incidentRepo,
		websiteRepo:  websiteRepo,
	}
}

func (s *IncidentService) OpenIncidentIfNeeded(
	ctx context.Context,
	websiteID string,
	regionID *string,
	status domain.WebsiteStatus,
	occurredAt time.Time,
) error {
	if status != domain.WebsiteDown {
		return nil
	}

	active, err := s.incidentRepo.GetActiveByWebsiteAndRegion(ctx, websiteID, regionID)
	if err != nil {
		return err
	}
	if active != nil {
		return nil
	}

	incident := &domain.Incident{
		WebsiteID:     websiteID,
		RegionID:      regionID,
		StartedAt:     occurredAt,
		CurrentStatus: status,
		IsActive:      true,
	}

	return s.incidentRepo.Create(ctx, incident)
}

func (s *IncidentService) ResolveIncidentIfNeeded(
	ctx context.Context,
	websiteID string,
	regionID *string,
	status domain.WebsiteStatus,
	occurredAt time.Time,
) error {
	if status != domain.WebsiteUp {
		return nil
	}

	active, err := s.incidentRepo.GetActiveByWebsiteAndRegion(ctx, websiteID, regionID)
	if err != nil {
		return err
	}
	if active == nil {
		return nil
	}

	return s.incidentRepo.Resolve(ctx, active.ID, occurredAt, status)
}

func (s *IncidentService) ListWebsiteIncidents(
	ctx context.Context,
	websiteID string,
	requesterUserID string,
	limit int,
) ([]dto.IncidentResponse, error) {
	website, err := s.websiteRepo.GetByID(ctx, websiteID)
	if err != nil {
		return nil, err
	}

	if website.UserID != requesterUserID {
		return nil, domain.ErrForbidden
	}

	incidents, err := s.incidentRepo.ListByWebsiteID(ctx, websiteID, limit)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	response := make([]dto.IncidentResponse, 0, len(incidents))

	for _, inc := range incidents {
		end := now
		if inc.ResolvedAt != nil {
			end = *inc.ResolvedAt
		}

		durationSeconds := int64(end.Sub(inc.StartedAt).Seconds())
		if durationSeconds < 0 {
			durationSeconds = 0
		}

		response = append(response, dto.IncidentResponse{
			ID:              inc.ID,
			WebsiteID:       inc.WebsiteID,
			RegionID:        inc.RegionID,
			StartedAt:       inc.StartedAt,
			ResolvedAt:      inc.ResolvedAt,
			IsActive:        inc.IsActive,
			CurrentStatus:   string(inc.CurrentStatus),
			DurationSeconds: durationSeconds,
		})
	}

	return response, nil
}
