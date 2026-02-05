package monitoringpusher

import (
	"github.com/RitikaxG/runState/apps/api-go/internal/redis"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
)

/* Defines the worker + constructor
- Its responsible for pushing websites into the monitoring stream
*/

type MonitoringPusher struct {
	websites repository.WebsiteRepository
	redis    *redis.Redis
	stream   string
}

func NewMonitoringPusher(
	websites repository.WebsiteRepository,
	redis *redis.Redis,
	stream string,
) *MonitoringPusher {
	return &MonitoringPusher{
		websites: websites,
		redis:    redis,
		stream:   stream,
	}
}
