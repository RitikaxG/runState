package routes

import (
	"github.com/RitikaxG/runState/apps/api-go/internal/auth"
	"github.com/RitikaxG/runState/apps/api-go/internal/handlers"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterWebsiteTicksRouter(
	r *gin.RouterGroup,
	handler *handlers.WebsiteTicksHandler,
	jwtManager *auth.JWTManager,
) {
	protected := r.Group("/websites")
	protected.Use(middleware.AuthMiddleware(jwtManager))
	protected.Use(middleware.RequireRole("ADMIN", "USER"))

	protected.GET(":/id/checks", handler.GetWebsiteChecks)
}
