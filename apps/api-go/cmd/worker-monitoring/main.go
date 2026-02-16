package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	worker "github.com/RitikaxG/runState/apps/api-go/internal/common-worker"
	"github.com/RitikaxG/runState/apps/api-go/internal/db"
	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/redis"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
	monitoringworker "github.com/RitikaxG/runState/apps/api-go/internal/workers/monitoring-worker"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	dbConn := db.NewPostgres(os.Getenv("DATABASE_URL"))
	defer dbConn.Close()

	redisClient, err := redis.NewRedis(os.Getenv("REDIS_ADDR"))

	if err != nil {
		log.Fatal(err)
	}

	defer redisClient.Close()

	httpClient := &http.Client{
		Timeout: 10 * time.Second,
	}

	websiteRepo := repository.NewWebsiteRepository(dbConn)
	websiteTickRepo := repository.NewWebsiteTicksRepository(dbConn)

	// ------- Creating monitoring worker -------------
	handler := monitoringworker.NewMonitoringWorker(
		os.Getenv("MONITORING_REGION_ID"),
		os.Getenv("STATUS_CHANGE_STREAM"),
		websiteRepo,
		websiteTickRepo,
		redisClient,
		httpClient,
	)

	handler.ForceNextStatus(
		"6509ae43-40df-4704-a369-c1c8bec2d21f",
		domain.WebsiteDown,
	)

	// ------------------ Engine ---------------------
	engine := worker.NewEngine(
		redisClient,
		os.Getenv("MONITORING_STREAM"),
		os.Getenv("MONITORING_GROUP"),
		os.Getenv("MONITORING_CONSUMER"),
		handler,
	)

	// ------------ GRACEFUL SHUTDOWN ----------------

	/* Create a buffered signal channel that holds 1 OS signal
	- os.Signal (SIGINT, SIGTERM..)
	*/
	sigCh := make(chan os.Signal, 1)

	/*
		Registers OS signal to listen for.
			- Whenever OS sends SIGINT or SIGTERM send it to sigCh
	*/
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	/*
		Start a shutodwn listener go routine
	*/
	go func() {
		// Waits until signal is recieved
		sig := <-sigCh
		log.Println("Shutdown signal recieved :", sig)
		engine.Stop(30 * time.Second) // Initiates graceful shutdown
	}()

	log.Println("Monitoring Worker Started")

	// Start the engine
	if err := engine.Run(); err != nil {
		log.Fatal(err)
	}
}
