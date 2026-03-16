package dto

import "time"

type ResponseTimePoint struct {
	Timestamp      time.Time `json:"timestamp"`
	ResponseTimeMs int64     `json:"response_time_ms"`
	Status         string    `json:"status"`
	RegionID       string    `json:"region_id"`
	RegionName     *string   `json:"region_name,omitempty"`
}
