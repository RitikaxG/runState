package routes

import (
	"github.com/RitikaxG/runState/apps/api-go/internal/auth"
	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/handlers"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterAdminRouter(
	r *gin.RouterGroup,
	jwtManagaer *auth.JWTManager,
	userHandler *handlers.UserHandler) {
	admin := r.Group("/admin")

	// 1. Authentication Required
	admin.Use(middleware.AuthMiddleware(jwtManagaer))

	// 2. Authorisation ( ADMIN only )
	admin.Use(middleware.RequireRole(domain.RoleAdmin))

	// 3. Admin only endpoints
	admin.GET("/users", userHandler.ListUsers)
}
