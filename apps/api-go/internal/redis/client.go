package redis

import (
	"context"
	"time"

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
