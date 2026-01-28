package redis

import (
	"context"
	"fmt"
	"time"
)

func (r *Redis) ShouldThrottle(
	ctx context.Context,
	websiteId string,
	statusType StatusType,
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
