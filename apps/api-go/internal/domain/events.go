package domain

type WebsiteEvent struct {
	WebsiteID string `json:"website_id"`
	URL       string `json:"url"`
}

type NotificationMessage struct {
	WebsiteID     string        `json:"website_id"`
	RegionID      *string       `json:"region_id"`
	PrevStatus    WebsiteStatus `json:"prev_status"`
	CurrentStatus WebsiteStatus `json:"current_status"`
	OccurredAt    string        `json:"occurred_at"`
}
