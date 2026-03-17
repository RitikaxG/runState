package dto

import "time"

type NotificationLogResponse struct {
	ID             string    `json:"id"`
	Channel        string    `json:"channel"`
	Recipient      string    `json:"recipient"`
	PrevStatus     string    `json:"prev_status"`
	CurrentStatus  string    `json:"current_status"`
	DeliveryStatus string    `json:"delivery_status"`
	SentAt         time.Time `json:"sent_at"`
	RegionID       *string   `json:"region_id"`
}
