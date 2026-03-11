package middleware

import (
	"strconv"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/metrics"
	"github.com/gin-gonic/gin"
)

// Updates metrics for each requests
/*
Incoming request
      │
      ▼
Increase in-flight requests
      │
      ▼
Start timer
      │
      ▼
Execute handler (c.Next())
      │
      ▼
Decrease in-flight requests
      │
      ▼
Record metrics
*/

func PrometheusMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		metrics.HTTPRequestsInFlight.Inc()
		start := time.Now()

		c.Next() // Execute Handler

		metrics.HTTPRequestsInFlight.Dec()

		statusCode := c.Writer.Status()
		status := strconv.Itoa(statusCode) // converts statusCode to string
		method := c.Request.Method

		route := c.FullPath()
		if route == "" {
			route = "Unknown"
		}

		duration := time.Since(start).Seconds()

		metrics.HTTPRequestTotal.WithLabelValues(method, route, status).Inc()
		metrics.HTTPRequestDuration.WithLabelValues(method, route, status).Observe(duration)

		if statusCode >= 400 {
			metrics.HTTPRequestErrorsTotal.WithLabelValues(method, route, status).Inc()
		}
	}
}
