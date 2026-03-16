package dto

import "time"

type WebsiteCheckItem struct {
	ID             string    `json:"id"`
	WebsiteID      string    `json:"website_id"`
	RegionID       string    `json:"region_id"`
	Status         string    `json:"status"`
	ResponseTimeMs int64     `json:"response_time_ms"`
	CreatedAt      time.Time `json:"created_at"`
	RegionName     *string   `json:"region_name,omitempty"`
}
