package dto

import "time"

type WebsiteListItem struct {
	ID                   string     `json:"id"`
	URL                  string     `json:"url"`
	CurrentStatus        string     `json:"current_status"`
	TimeAdded            time.Time  `json:"time_added"`
	LastCheckedAt        *time.Time `json:"last_checked_at"`
	LatestResponseTimeMs *int64     `json:"latest_response_time_ms"`
}
