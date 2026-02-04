package domain

import "time"

type WebsiteTicks struct {
	ID             string        `db:"id"`
	WebsiteID      string        `db:"website_id"`
	RegionID       string        `db:"region_id"`
	Status         WebsiteStatus `db:"status"`
	ResponseTimeMs int64         `db:"response_time_ms"`
	CreatedAt      time.Time     `db:"created_at"`
}
