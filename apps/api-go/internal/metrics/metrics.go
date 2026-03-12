package metrics

// Prometheus Metrics Initialization Module
import (
	"sync"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	once sync.Once // ensures that metrics are registered only once, prometheus panics if metrics are registered twice
	// Global Metrics Objects
	HTTPRequestTotal       *prometheus.CounterVec
	HTTPRequestErrorsTotal *prometheus.CounterVec
	HTTPRequestDuration    *prometheus.HistogramVec // used to measure request latency distribution
	HTTPRequestsInFlight   prometheus.Gauge         // track number of requests currently processing
)

func Init() {
	once.Do(func() { // ensures that block runs exactly once

		/* http_requests_total{method="GET",route="/health",status="200"} 150

		Answers :
		- How many requests per endpoint?
		- How many 500 errors?
		- Which endpoint is busiest?
		*/

		HTTPRequestTotal = promauto.NewCounterVec(
			prometheus.CounterOpts{
				Name: "http_requests_total",
				Help: "Total number of HTTP requests",
			},
			[]string{"method", "route", "status"},
		)

		// Counts Error Responses only
		HTTPRequestErrorsTotal = promauto.NewCounterVec(
			prometheus.CounterOpts{
				Name: "http_requests_errors_total",
				Help: "Total number of error HTTP requests",
			},
			[]string{"method", "route", "status"},
		)

		// Tracks Requests Latency
		HTTPRequestDuration = promauto.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "http_request_duration_seconds",
				Help:    "HTTP request duration in seconds",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"method", "route", "status"},
		)

		// Tracks how many requests are being processed right now.
		HTTPRequestsInFlight = promauto.NewGauge(
			prometheus.GaugeOpts{
				Name: "http_requests_in_flight",
				Help: "Current number of in-flight HTTP requests",
			},
		)
	})
}
