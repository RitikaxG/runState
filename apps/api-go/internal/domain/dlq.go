package domain

import "time"

// Redis Stream hash payloads do not have any tags

type DLQMessage struct {
	MessageID     string
	WebsiteID     string
	PrevStatus    WebsiteStatus
	CurrentStatus WebsiteStatus
	OccurredAt    time.Time
	Retries       int
	Reason        string
}
