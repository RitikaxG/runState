package domain

type StreamPayload struct {
	WebsiteID     string         `json:"website_id"`
	URL           *string        `json:"url"`
	PrevStatus    *WebsiteStatus `json:"prev_status"`
	CurrentStatus *WebsiteStatus `json:"current_status"`
	OccurredAt    *string        `json:"occurred_at"`
}

type StreamMessage struct {
	ID      string        `json:"id"`
	Message StreamPayload `json:"message"`
}

type StreamResponse struct {
	Name    string          `json:"name"`
	Message []StreamMessage `json:"messages"`
}

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
