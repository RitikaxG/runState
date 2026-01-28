package redis

import (
	"context"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	goredis "github.com/redis/go-redis/v9"
)

func (r *Redis) ReclaimPendingNotification(
	ctx context.Context,
	stream string,
	group string,
	consumer string,
) ([]domain.StreamMessage, error) {

	cmd := r.Client.XAutoClaim(ctx, &goredis.XAutoClaimArgs{
		Stream:   stream,
		Group:    group,
		Consumer: consumer,
		MinIdle:  60 * time.Second,
		Start:    "0-0",
		Count:    10,
	})

	/*
	 nextStart ID  : where redis wants you to resume claiming from
	 redisMessages : claimed messages
	*/
	redisMessages, nextStart, err := cmd.Result()
	if err != nil {
		return nil, err
	}

	/* This line means :
	- Yes compiler, I know this value exists. I intentionally don’t need it right now.”
	- Since Go does not allow unused variable
	*/
	_ = nextStart

	/* This creates a slice of type []domain.StreamMessage
	- Initial length : 0
	- Pre-all0cated capacity : len(redisMessages)
	*/
	result := make([]domain.StreamMessage, 0, len(redisMessages))

	for _, msg := range redisMessages {
		// This creates an empty struct value
		payload := domain.StreamPayload{}

		/*
			- Required field, field type = string ( Directly pass the value e.g payload.WebsiteID = v )
			- Optional Field , field type = *string
				* For optional fields, if value exists -> take address, if value missing -> leave nil
				* That's why &v ( Pass address to value )
		*/
		if v, ok := msg.Values["website_id"].(string); ok {
			payload.WebsiteID = v
		}

		if v, ok := msg.Values["url"].(string); ok {
			payload.URL = &v
		}

		if v, ok := msg.Values["prev_status"].(string); ok {
			s := domain.WebsiteStatus(v)

			payload.PrevStatus = &s
		}

		if v, ok := msg.Values["current_status"].(string); ok {
			s := domain.WebsiteStatus(v)

			payload.CurrentStatus = &s
		}

		if v, ok := msg.Values["occurred_at"].(string); ok {
			payload.OccurredAt = &v
		}

		result = append(result, domain.StreamMessage{
			ID:      msg.ID,
			Message: payload,
		})
	}
	return result, nil
}
