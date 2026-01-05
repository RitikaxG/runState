package middleware

import (
	"net/http"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	contextutil "github.com/RitikaxG/runState/apps/api-go/internal/http/context"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/response"
	"github.com/gin-gonic/gin"
)

// Returns a gin middleware function
// It runs once at startup when routes are registered.
func RequireRole(allowedRoles ...domain.Role) gin.HandlerFunc {
	// This func runs on every HTTP Request
	return func(c *gin.Context) {

		if len(allowedRoles) == 0 {
			c.AbortWithStatusJSON(http.StatusForbidden, response.APIResponse{
				Success: false,
				Error:   domain.ErrForbidden.Error(),
			})
			return
		}

		role, err := contextutil.GetUserRole(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, response.APIResponse{
				Success: false,
				Error:   domain.ErrUnauthorized.Error(),
			})
			return
		}

		for _, allowed := range allowedRoles {
			if role == allowed {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, response.APIResponse{
			Success: false,
			Error:   domain.ErrForbidden.Error(),
		})

	}
}
