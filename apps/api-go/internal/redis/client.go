package redis

import (
	"context"
	"crypto/tls"
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	goredis "github.com/redis/go-redis/v9"
)

// It defines a new type called Redis that wraps the raw go-redis client. You can now attach methods to it
type Redis struct {
	Client *goredis.Client
}

// addr : Redis Server Address ( localhost:6379 )
func NewRedis(addr string) (*Redis, error) {
	/* 1. Lazy Client Initialization
	- Creates a Redis object
	- Set up config, onnection pool , internal state
	*/
	rdb := goredis.NewClient(&goredis.Options{
		Addr: addr,
	})

	/*
		Context gets cancelled automatically after 10 sec ( If Redis refuses connnection )
	*/
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel() // Stops the timer and frees internal resources

	/*
		- If Ping succeeds → function returns → cancel() runs
		- If Ping fails → function returns → cancel() runs
		- If Redis hangs → 10s timeout → function returns → cancel() runs

		It guarantees cleanup, not cancellation timing.

		The timeout triggers cancellation automatically.
		defer cancel() is just cleanup.
	*/

	// Actual Redis Connection happens
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, err
	}
	return &Redis{
		Client: rdb,
	}, nil
}

/*
- This defines a method on your Redis struct
- It calls Close() on the underlying go-redis client
- It returns any error from that call
*/
func (r *Redis) Close() error {
	return r.Client.Close() // Closes the Redis connection pool owned by you app.
}

func NewRedisFromEnv() (*Redis, error) {
	_ = godotenv.Load()

	if url := os.Getenv("REDIS_URL"); url != "" {
		/*
			- Converts URL -> redis.Options
			- Extracts Addr, Username, Password, TLS Settings
		*/
		opts, err := goredis.ParseURL(url)
		if err != nil {
			return nil, fmt.Errorf("parse redis url : %w", err)
		}

		/*
			- Enforces TLS when needed
			- Some providers require TLS , but give URLs like redis:// instead of rediss://
			  If you don’t attach TLSConfig, connection fails.
		*/
		if opts.TLSConfig == nil && len(url) >= 9 && url[:9] == "redis://" {
			opts.TLSConfig = &tls.Config{}
		}
		// Create Redis Client
		rdb := goredis.NewClient(opts)

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := rdb.Ping(ctx).Err(); err != nil {
			return nil, fmt.Errorf("redis ping (REDIS_URL) : %w", err)
		}
		return &Redis{
			Client: rdb,
		}, nil
	}
	// Fallback to REDIS_ADDR ( LOCAL/DOCKER )
	addr := os.Getenv("REDIS_ADDR")

	if addr == "" {
		return nil, fmt.Errorf("set REDIS_URL (recommended) or REDIS_ADDR")
	}

	// Create Redis Client ( Non-TLS )
	rdb := goredis.NewClient(&goredis.Options{
		Addr: addr,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis ping (REDIS_ADDR) : %w", err)
	}
	return &Redis{
		Client: rdb,
	}, nil
}
