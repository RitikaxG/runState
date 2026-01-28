package redis

import (
	"context"
	"fmt"
	"time"

	goredis "github.com/redis/go-redis/v9"
)

const retryTTL = 24 * time.Hour

func retryKey(id string) string {
	return fmt.Sprintf("notification:retry:%s", id)
}

// Store retry count inside redis
func (r *Redis) GetRetryCount(
	ctx context.Context,
	id string,
) (int64, error) {

	val, err := r.Client.Get(ctx, retryKey(id)).Int64()
	if err != nil {
		if err == goredis.Nil {
			return 0, nil
		}
		return 0, err
	}

	return val, nil
}

func (r *Redis) IncrementRetry(
	ctx context.Context,
	id string,
) (int64, error) {

	count, err := r.Client.Incr(ctx, retryKey(id)).Result()

	if err != nil {
		return 0, err
	}

	// If first retry, set TTL
	if count == 1 {
		if err := r.Client.Expire(ctx, retryKey(id), retryTTL).Err(); err != nil {
			return 0, err
		}

	}
	return count, nil
}

func (r *Redis) ResetRetry(
	ctx context.Context,
	id string,
) error {

	return r.Client.Del(ctx, retryKey(id)).Err()
}
