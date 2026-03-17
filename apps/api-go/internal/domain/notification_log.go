package domain

import "time"

type NotificationLog struct {
	ID                string
	WebsiteID         string
	IncidentID        *string
	RegionID          *string
	Channel           string
	Recipient         string
	PrevStatus        WebsiteStatus
	CurrentStatus     WebsiteStatus
	DeliveryStatus    string
	ProviderMessageID *string
	SentAt            time.Time
	CreatedAt         time.Time
}
