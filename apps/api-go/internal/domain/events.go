package domain

// Redis Stream hash payloads do not have any tags

type WebsiteEvent struct {
	WebsiteID string
	URL       string
}

type NotificationMessage struct {
	WebsiteID     string
	RegionID      *string
	PrevStatus    WebsiteStatus
	CurrentStatus WebsiteStatus
	OccurredAt    string
}
