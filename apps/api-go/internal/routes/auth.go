package routes

import (
	"github.com/RitikaxG/runState/apps/api-go/internal/handlers"
	"github.com/gin-gonic/gin"
)

func RegisterAuthRouter(
	r *gin.RouterGroup,
	handler *handlers.AuthHandler,
) {
	auth := r.Group("/auth")

	auth.POST("/refresh", handler.Refresh)
	auth.POST("/logout", handler.Logout)

}
