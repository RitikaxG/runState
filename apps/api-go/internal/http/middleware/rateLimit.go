package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/response"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate" // token bucket rate limiter
)

// It stores rate-limit state per IP ( One rate limiter per client IP )
type ClientLimiter struct {
	limiter  *rate.Limiter // controls requests rate
	lastSeen time.Time     // last request time
}

/*
clients

  - Key: IP address (string)
  - Value: limiter for that IP
  - Example:
    clients["192.168.1.5"] → *ClientLimiter

mu
  - Protects the map
  - Prevents race conditions
  - Required because Gin runs requests concurrently
*/
var (
	clients = make(map[string]*ClientLimiter)
	mu      sync.Mutex
)

/*
	 It limits how many requests single client IP can make per second
		- Get client IP
		- Get or create a rate limiter for that IP
		- Ask the limiter ( Can I allow this request ? )
		- If NO, block request
		- If YES, let request continue
*/
func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Get client IP
		ip := c.ClientIP()

		// 2. Lock before accessing shared map ( multiple requests, multiple goroutines, same map)
		mu.Lock()
		// 3. Get or create limiter for client IP
		limiter, exists := clients[ip]
		if !exists {
			limiter = &ClientLimiter{
				/*
					Token-bucket model:

						- Tokens refill at 5/sec
						- Max tokens = 10
						- Each request consumes 1 token
				*/
				limiter:  rate.NewLimiter(20, 40), // 5 req/sec , burst 10
				lastSeen: time.Now(),
			}
			clients[ip] = limiter
		}
		/*
			This is used later to:

				- Remove inactive IPs
				- Prevent memory leak
		*/
		limiter.lastSeen = time.Now()
		// Dont hold mutex during request processing
		mu.Unlock()

		// limiter.limiter.Allow() : returns true if request is allowed, blocks requests if limit is exceeded
		if !limiter.limiter.Allow() {
			c.JSON(http.StatusTooManyRequests, response.APIResponse{
				Success: false,
				Error:   domain.ErrRateLimitExceeded.Error(),
			})
			c.Abort()
			return
		}
		// Pass request to next middleware
		c.Next()

	}
}

// This func is called once when server starts
func StartRateLimiterCleanup() {
	// Starts a goroutine, this runs aynchronously
	// This goroutine never exists while app is running
	go func() {
		// Infinite loop
		for {
			// Wait 1 min btw cleanup cycles
			time.Sleep(1 * time.Minute)
			// Since clients map is shared & gin handlers are running concurrently
			mu.Lock()

			for ip, client := range clients {
				if time.Since(client.lastSeen) > 5*time.Minute {
					/*
						- Removes that IP’s limiter
						- Frees memory
					*/
					delete(clients, ip)
				}
			}
			// Releases the mutex. Other requests can now safely access clients
			mu.Unlock()
		}

	}() // ends go routine
}
