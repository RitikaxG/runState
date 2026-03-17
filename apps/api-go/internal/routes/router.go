package routes

import (
	"github.com/RitikaxG/runState/apps/api-go/internal/auth"
	"github.com/RitikaxG/runState/apps/api-go/internal/handlers"
	"github.com/gin-gonic/gin"
)

func RegisterRouter(
	r *gin.Engine,
	websiteTicksHandler *handlers.WebsiteTicksHandler,
	websiteHandler *handlers.WebsiteHandler,
	userHandler *handlers.UserHandler,
	authHandler *handlers.AuthHandler,
	incidentHandler *handlers.IncidentHandler,
	jwtManager *auth.JWTManager) {
	v1 := r.Group("/api/v1") // gin.Engine : Builds the server

	// Attach routes to the engine
	RegisterWebsitesRouter(v1, websiteHandler, incidentHandler, jwtManager)
	RegisterUserRouter(v1, userHandler, jwtManager)
	RegisterHealthRouter(v1)
	RegisterAdminRouter(v1, jwtManager, userHandler)
	RegisterAuthRouter(v1, authHandler)
	RegisterWebsiteTicksRouter(v1, websiteTicksHandler, jwtManager)
}
