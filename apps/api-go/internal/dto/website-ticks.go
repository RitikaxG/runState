package dto

import "time"

type WebsiteTicksResponse struct {
	ID             string    `json:"id"`
	WebsiteID      string    `json:"website_id"`
	RegionID       string    `json:"region_id"`
	Status         string    `json:"status"`
	ResponseTimeMs int64     `json:"response_time_ms"`
	CheckedAt      time.Time `json:"checked_at"`
}
