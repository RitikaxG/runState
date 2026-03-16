package routes

import (
	"github.com/RitikaxG/runState/apps/api-go/internal/auth"
	"github.com/RitikaxG/runState/apps/api-go/internal/handlers"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterUserRouter(
	r *gin.RouterGroup,
	handler *handlers.UserHandler,
	jwtManager *auth.JWTManager,
) {
	user := r.Group("/")
	user.POST("/signup", handler.Signup)
	user.POST("/signin", handler.Signin)

	protected := r.Group("/")
	protected.Use(middleware.AuthMiddleware(jwtManager))
	protected.GET("/me", handler.GetMe)
}

/*
	- After signing in you get a JWT token
	- This token must be sent in authorization header for every protected request
*/
