package redis

import (
	"context"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	goredis "github.com/redis/go-redis/v9"
)

func (r *Redis) XAddStatusChangeStream(
	ctx context.Context,
	stream string,
	websiteId string,
	prevStatus domain.WebsiteStatus,
	currentStatus domain.WebsiteStatus,
) error {
	args := &goredis.XAddArgs{
		Stream: stream,
		ID:     "*",
		Values: map[string]interface{}{
			"website_id":     websiteId,
			"prev_status":    string(prevStatus),
			"current_status": string(currentStatus),
			"occurred_at":    time.Now().UTC().Format(time.RFC3339),
		},
		MaxLen: 100_000,
		Approx: true,
	}

	return r.Client.XAdd(ctx, args).Err()
}
