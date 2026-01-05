package routes

import (
	"github.com/RitikaxG/runState/apps/api-go/internal/auth"
	"github.com/RitikaxG/runState/apps/api-go/internal/handlers"
	"github.com/gin-gonic/gin"
)

func RegisterRouter(
	r *gin.Engine,
	websiteHandler *handlers.WebsiteHandler,
	userHandler *handlers.UserHandler,
	authHandler *handlers.AuthHandler,
	jwtManager *auth.JWTManager) {
	v1 := r.Group("/api/v1") // gin.Engine : Builds the server

	// Attach routes to the engine
	RegisterWebsitesRouter(v1, websiteHandler, jwtManager)
	RegisterUserRouter(v1, userHandler)
	RegisterHealthRouter(v1)
	RegisterAdminRouter(v1, jwtManager, userHandler)
	RegisterAuthRouter(v1, authHandler)
}
