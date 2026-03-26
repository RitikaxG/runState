package dto

import "time"

type PublicWebsiteSummary struct {
	ID            string    `json:"id"`
	URL           string    `json:"url"`
	Slug          string    `json:"slug"`
	CurrentStatus string    `json:"current_status"`
	TimeAdded     time.Time `json:"time_added"`
}

type PublicStatusPageData struct {
	Website PublicWebsiteSummary `json:"website"`
}
