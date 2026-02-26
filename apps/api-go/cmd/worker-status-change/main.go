package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	worker "github.com/RitikaxG/runState/apps/api-go/internal/common-worker"
	"github.com/RitikaxG/runState/apps/api-go/internal/db"
	"github.com/RitikaxG/runState/apps/api-go/internal/redis"
	statuschangeworker "github.com/RitikaxG/runState/apps/api-go/internal/workers/status-change-worker"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	dbConn := db.NewPostgres(os.Getenv("DATABASE_URL"))
	defer dbConn.Close()

	redisClient, err := redis.NewRedisFromEnv()
	if err != nil {
		log.Fatal(err)
	}
	defer redisClient.Close()

	handler := statuschangeworker.NewStatusChangeWorker(
		os.Getenv("NOTIFICATION_STREAM"),
		redisClient,
	)

	engine := worker.NewEngine(
		redisClient,
		os.Getenv("STATUS_CHANGE_STREAM"),
		os.Getenv("STATUS_CHANGE_GROUP"),
		os.Getenv("STATUS_CHANGE_CONSUMER"),
		handler,
	)

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigCh
		log.Println("Shutdown signal recieved", sig)
		engine.Stop(30 * time.Second)
	}()

	log.Println("Status Change worker started")

	if err := engine.Run(); err != nil {
		log.Fatal(err)
	}
}
