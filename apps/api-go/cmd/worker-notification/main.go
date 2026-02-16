package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/channels"
	worker "github.com/RitikaxG/runState/apps/api-go/internal/common-worker"
	"github.com/RitikaxG/runState/apps/api-go/internal/db"
	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/redis"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
	notificationworker "github.com/RitikaxG/runState/apps/api-go/internal/workers/notification-worker"
	"github.com/joho/godotenv"
)

// Bootstraps and runs the Notification Worker as a long-running service with graceful shutdown.
func main() {

	_ = godotenv.Load()
	dbConn := db.NewPostgres(os.Getenv("DATABASE_URL"))
	defer dbConn.Close()

	redisClient, err := redis.NewRedis(os.Getenv("REDIS_ADDR"))
	if err != nil {
		log.Fatal(err)
	}
	defer redisClient.Close()

	websiteRepo := repository.NewWebsiteRepository(dbConn)

	// Channel Registry ( Notification Channels )
	channelRegistry := channels.ChannelRegistry{
		domain.ChannelEmail: channels.NewEmailChannel(
			os.Getenv("MAILGUN_API_KEY"),
			os.Getenv("MAILGUN_DOMAIN"),
			os.Getenv("MAILGUN_SENDER"),
		),
		domain.ChannelWebhook: channels.NewWebhookChannel(),
	}

	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail == "" {
		log.Fatal("ADMIN EMAIL NOT FOUND")
	}

	rules := []notificationworker.NotificationRule{
		{
			Channel:  "email",
			NotifyOn: "BOTH",
			Target:   adminEmail,
			Enabled:  true,
		},
	}

	handler := notificationworker.NewNotificationWorker(
		redisClient,
		os.Getenv("NOTIFICATION_STREAM"),
		channelRegistry,
		rules,
		websiteRepo,
		os.Getenv("NOTIFICATION_GROUP"),
		os.Getenv("NOTIFICATION_CONSUMER"),
	)

	engine := worker.NewEngine(
		redisClient,
		os.Getenv("NOTIFICATION_STREAM"),
		os.Getenv("NOTIFICATION_GROUP"),
		os.Getenv("NOTIFICATION_CONSUMER"),
		handler,
	)

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigCh
		log.Println("Shutdown signal recieved:", sig)
		engine.Stop(30 * time.Second)

	}()

	log.Println("Notification Worker started")

	if err := engine.Run(); err != nil {
		log.Fatal(err)
	}

}
