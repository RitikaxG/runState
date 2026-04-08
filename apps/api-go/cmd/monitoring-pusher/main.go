package main

import (
	"log"
	"os"

	"github.com/RitikaxG/runState/apps/api-go/internal/db"
	"github.com/RitikaxG/runState/apps/api-go/internal/redis"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
	monitoringpusher "github.com/RitikaxG/runState/apps/api-go/internal/workers/monitoring-pusher"
	"github.com/joho/godotenv"
)

func main() {
	log.Printf("Starting monitoring pusher")
	_ = godotenv.Load()

	dbConn := db.NewPostgres(os.Getenv("DATABASE_URL"))

	/* Reconnects to the Same Redis Server with all its existing data intact
	- This creates a new client connection to an already existing Redis Server
	*/
	redisClient, err := redis.NewRedisFromEnv()
	if err != nil {
		log.Fatal(err)
	}

	defer dbConn.Close()
	defer redisClient.Close()

	websiteRepo := repository.NewWebsiteRepository(dbConn)

	// start the monitoring pusher
	if err := monitoringpusher.RunMonitoringPusher(
		websiteRepo,
		redisClient,
		os.Getenv("MONITORING_STREAM"),
	); err != nil {
		log.Fatal(err)
	}
}
