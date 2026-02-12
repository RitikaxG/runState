package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

func (r *Redis) ShouldThrottle(
	ctx context.Context,
	websiteId string,
	statusType domain.EventType,
	channel string,
) (bool, error) {
	key := fmt.Sprintf("rate:%s:%s:%s", websiteId, channel, statusType)

	ok, err := r.Client.SetNX(
		ctx,
		key,
		"1",
		5*time.Minute,
	).Result()

	if err != nil {
		return false, err
	}

	// res == true  -> key was set (DO NOT throttle)
	// res == false -> key already existed (throttle)
	return !ok, nil
}
