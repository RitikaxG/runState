package redis

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	goredis "github.com/redis/go-redis/v9"
)

func (r *Redis) XAddNotificationStream(
	ctx context.Context,
	stream string,
	msg domain.NotificationMessage,
) error {
	values := map[string]interface{}{
		"website_id":     msg.WebsiteID,
		"prev_status":    msg.PrevStatus,
		"current_status": msg.CurrentStatus,
		"occurred_at":    msg.OccurredAt,
	}

	// Since RegionID is optional field
	if msg.RegionID != nil {
		values["region_id"] = *msg.RegionID
	}

	args := &goredis.XAddArgs{
		Stream: stream,
		ID:     "*",
		Values: values,
		MaxLen: 100_000,
		Approx: true,
	}

	return r.Client.XAdd(ctx, args).Err()
}
