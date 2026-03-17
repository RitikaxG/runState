package service

import (
	"context"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/dto"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
)

type RecordNotificationAttemptInput struct {
	WebsiteID         string
	IncidentID        *string
	RegionID          *string
	Channel           string
	Recipient         string
	PrevStatus        domain.WebsiteStatus
	CurrentStatus     domain.WebsiteStatus
	DeliveryStatus    string
	ProviderMessageID *string
	SentAt            time.Time
}

type NotificationLogService struct {
	notificationLogRepo repository.NotificationLogRepository
	websiteRepo         repository.WebsiteRepository
}

func NewNotificationLogService(
	notificationLogRepo repository.NotificationLogRepository,
	websiteRepo repository.WebsiteRepository,
) *NotificationLogService {
	return &NotificationLogService{
		notificationLogRepo: notificationLogRepo,
		websiteRepo:         websiteRepo,
	}
}

func (s *NotificationLogService) RecordNotificationAttempt(
	ctx context.Context,
	input RecordNotificationAttemptInput,
) error {
	log := &domain.NotificationLog{
		WebsiteID:         input.WebsiteID,
		IncidentID:        input.IncidentID,
		RegionID:          input.RegionID,
		Channel:           input.Channel,
		Recipient:         input.Recipient,
		PrevStatus:        input.PrevStatus,
		CurrentStatus:     input.CurrentStatus,
		DeliveryStatus:    input.DeliveryStatus,
		ProviderMessageID: input.ProviderMessageID,
		SentAt:            input.SentAt,
	}

	return s.notificationLogRepo.Create(ctx, log)
}

func (s *NotificationLogService) ListWebsiteNotifications(
	ctx context.Context,
	websiteID string,
	requesterUserID string,
	limit int,
) ([]dto.NotificationLogResponse, error) {
	website, err := s.websiteRepo.GetByID(ctx, websiteID)
	if err != nil {
		return nil, err
	}

	if website.UserID != requesterUserID {
		return nil, domain.ErrForbidden
	}

	logs, err := s.notificationLogRepo.ListByWebsiteID(ctx, websiteID, limit)
	if err != nil {
		return nil, err
	}

	response := make([]dto.NotificationLogResponse, 0, len(logs))
	for _, item := range logs {
		response = append(response, dto.NotificationLogResponse{
			ID:             item.ID,
			Channel:        item.Channel,
			Recipient:      item.Recipient,
			PrevStatus:     string(item.PrevStatus),
			CurrentStatus:  string(item.CurrentStatus),
			DeliveryStatus: item.DeliveryStatus,
			SentAt:         item.SentAt,
			RegionID:       item.RegionID,
		})
	}

	return response, nil
}
