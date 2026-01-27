package redis

import (
	"context"
	"fmt"
	"time"

	goredis "github.com/redis/go-redis/v9"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

func (r *Redis) SetCurrentStatus(
	ctx context.Context,
	websiteId string,
	status domain.WebsiteStatus,
) error {
	key := fmt.Sprintf("website:%s:status", websiteId)

	return r.Client.Set(
		ctx,
		key,
		string(status),
		10*time.Minute,
	).Err()
}

func (r *Redis) getPreviousStatusRedis(
	ctx context.Context,
	websiteId string,
) (*domain.WebsiteStatus, error) {

	key := fmt.Sprintf("website:%s:status", websiteId)

	val, err := r.Client.Get(ctx, key).Result()
	if err != nil {
		if err.Error() == string(goredis.Nil) {
			return nil, nil
		}
		return nil, err
	}

	status := domain.WebsiteStatus(val)
	return &status, nil
}
