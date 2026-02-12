package channels

import "github.com/RitikaxG/runState/apps/api-go/internal/domain"

/*
Channel Registry is a map where
	- key : type of notification channel
	- value : object that knows how to send notification

Any struct that implements Send(ctx, payload) (string, error) can be stored in the registry
*/

type ChannelRegistry map[domain.NotificationChannelType]NotificationChannel
