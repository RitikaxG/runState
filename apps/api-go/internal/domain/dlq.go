package domain

import "time"

type DLQMessage struct {
	MessageID     string
	WebsiteID     string
	PrevStatus    WebsiteStatus
	CurrentStatus WebsiteStatus
	OccurredAt    time.Time
	Retries       int
	Reason        string
}
