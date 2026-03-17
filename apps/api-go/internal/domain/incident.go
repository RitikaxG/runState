package domain

import "time"

type Incident struct {
	ID            string
	WebsiteID     string
	RegionID      *string
	StartedAt     time.Time
	ResolvedAt    *time.Time
	CurrentStatus WebsiteStatus
	IsActive      bool
	CreatedAt     time.Time
}
