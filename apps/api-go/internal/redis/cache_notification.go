package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	goredis "github.com/redis/go-redis/v9"
)

const notificationSentTTL = 7 * 24 * time.Hour

func (r *Redis) MarkAsSentOnce(
	ctx context.Context,
	websiteId string,
	statusType domain.EventType,
) (bool, error) {
	key := fmt.Sprintf("notification:sent:%s:%s", websiteId, statusType)

	ok, err := r.Client.SetNX(
		ctx,
		key,
		"1",
		notificationSentTTL,
	).Result()

	if err != nil {
		return false, err
	}

	return ok, nil
}

func (r *Redis) IsAlreadySent(
	ctx context.Context,
	websiteId string,
	statusType domain.EventType,
) (bool, error) {

	key := fmt.Sprintf("notification:sent:%s:%s", websiteId, statusType)

	val, err := r.Client.Get(
		ctx,
		key,
	).Result()

	if err == goredis.Nil {
		return false, nil
	}

	if err != nil {
		return false, err
	}

	return val == "1", nil
}
