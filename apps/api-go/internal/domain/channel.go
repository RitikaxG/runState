package domain

type NotificationChannelType string

const (
	ChannelEmail   NotificationChannelType = "email"
	ChannelWebhook NotificationChannelType = "webhook"
)
