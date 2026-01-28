package redis

// Dead Letter Queue

import (
	"context"
	"fmt"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	goredis "github.com/redis/go-redis/v9"
)

func (r *Redis) PushToDLQ(
	ctx context.Context,
	stream string,
	msg domain.DLQMessage,
) error {
	streamName := fmt.Sprintf("%s:dlq", stream)

	return r.Client.XAdd(ctx, &goredis.XAddArgs{
		Stream: streamName,
		ID:     "*",
		Values: map[string]interface{}{
			"message_id":     msg.MessageID,
			"website_id":     msg.WebsiteID,
			"prev_status":    msg.PrevStatus,
			"current_status": msg.CurrentStatus,
			"occurred_at":    msg.OccurredAt.Format(time.RFC3339),
			"retries":        msg.Retries,
			"reason":         msg.Reason,
		},
	}).Err()
}
