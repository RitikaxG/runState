package app

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/auth"
	"github.com/RitikaxG/runState/apps/api-go/internal/db"
	"github.com/RitikaxG/runState/apps/api-go/internal/db/seed"
	"github.com/RitikaxG/runState/apps/api-go/internal/handlers"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/middleware"
	"github.com/RitikaxG/runState/apps/api-go/internal/redis"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
	"github.com/RitikaxG/runState/apps/api-go/internal/routes"
	"github.com/RitikaxG/runState/apps/api-go/internal/service"
	"github.com/RitikaxG/runState/apps/api-go/internal/validation"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/jmoiron/sqlx"
)

type App struct {
	Server *http.Server // http.Server : enables graceful shutdown
	Redis  *redis.Redis
	DB     *sqlx.DB

	ctx    context.Context
	Cancel context.CancelFunc
}

func BuildServer() (*App, error) {
	/* Creates a root context for the entire app

	- Creates a cancel function ( cancel )
	- Any code holding context can :
		* check when the app is shutting down.
		* stop work gracefully
	- Calling cancel() broadcasts a shutdown signal

	*/
	ctx, cancel := context.WithCancel(context.Background())

	r := gin.Default()

	dbConn := db.NewPostgres(os.Getenv("DATABASE_URL"))
	log.Println(os.Getenv("DATABASE_URL"))

	redisClient, err := redis.NewRedis(os.Getenv("REDIS_ADDR"))
	if err != nil {
		cancel()
		return nil, err
	}

	server := &http.Server{
		Addr:    ":3001",
		Handler: r,
	}

	env := os.Getenv("APP_ENV")

	if env == "dev" || env == "local" {
		if err := seed.SeedAdmin(dbConn); err != nil {
			log.Fatal("failed to seed admin:", err)
		}
	} else {
		log.Println(">>> Seed skipped")
	}

	// 1. Initialise JWT Manager
	jwtManager := auth.NewJWTManager(
		os.Getenv("JWT_SECRET"),
		24*time.Hour,
	)

	// Start cleanup goroutine once
	middleware.StartRateLimiterCleanup()

	// Apply rate limiting to all requests
	r.Use(middleware.RateLimitMiddleware())

	websiteRepo := repository.NewWebsiteRepository(dbConn)
	websiteService := service.NewWebsiteService(websiteRepo)
	websiteHandler := handlers.NewWebsiteHandler(websiteService)

	userRepo := repository.NewUserRepository(dbConn)
	refreshRepo := repository.NewRefreshTokenRepository(dbConn)

	userService := service.NewUserService(userRepo, jwtManager)
	authService := service.NewAuthService(userRepo, refreshRepo, jwtManager)

	userHandler := handlers.NewUserHandler(userService, authService)
	authHandler := handlers.NewAuthHandler(authService)

	routes.RegisterRouter(r, websiteHandler, userHandler, authHandler, jwtManager)

	/*
		Custom validators live in a validation package and must be registered once during app startup before routes run.

			It gets Gin’s internal validator engine,
			safely casts it to *validator.Validate, and registers your custom password rule.

			- binding.Validator : Gin's global validator instance
			- binding.Validator.Engine() : returns actual underlying validator, its return type is interface
			- .(*validator.Validate) → type assertion
				 Is this engine actually a *validator.Validate ?
				 Since it returned an interface this type check is imp)
			- ok : true if assertion succeeded otherwise false
	*/
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		validation.RegisterPasswordValidator(v)
	}

	return &App{
		Server: server,
		Redis:  redisClient,
		DB:     dbConn, // dbConn later
		ctx:    ctx,
		Cancel: cancel,
	}, nil
}
