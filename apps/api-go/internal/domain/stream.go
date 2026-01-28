package domain

// Redis Stream hash payloads do not have any tags

type StreamPayload struct {
	WebsiteID     string
	URL           *string
	PrevStatus    *WebsiteStatus
	CurrentStatus *WebsiteStatus
	OccurredAt    *string
}

type StreamMessage struct {
	ID      string
	Message StreamPayload
}

type StreamResponse struct {
	Name    string
	Message []StreamMessage
}
