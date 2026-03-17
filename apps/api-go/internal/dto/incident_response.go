package dto

import "time"

type IncidentResponse struct {
	ID              string     `json:"id"`
	WebsiteID       string     `json:"website_id"`
	RegionID        *string    `json:"region_id,omitempty"`
	StartedAt       time.Time  `json:"started_at"`
	ResolvedAt      *time.Time `json:"resolved_at,omitempty"`
	IsActive        bool       `json:"is_active"`
	CurrentStatus   string     `json:"current_status"`
	DurationSeconds int64      `json:"duration_seconds"`
}
