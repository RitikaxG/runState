package routes

import (
	"github.com/RitikaxG/runState/apps/api-go/internal/handlers"
	"github.com/gin-gonic/gin"
)

func RegisterUserRouter(
	r *gin.RouterGroup,
	handler *handlers.UserHandler,
) {
	user := r.Group("/")
	user.POST("/signup", handler.Signup)
	user.POST("/signin", handler.Signin)
}

/*
	- After signing in you get a JWT token
	- This token must be sent in authorization header for every protected request
*/
