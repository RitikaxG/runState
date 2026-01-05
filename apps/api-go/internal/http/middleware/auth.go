package middleware

import (
	"net/http"
	"strings"

	"github.com/RitikaxG/runState/apps/api-go/internal/auth"
	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/response"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtManager *auth.JWTManager) gin.HandlerFunc {
	// 1. Read token from header
	return func(c *gin.Context) {
		// Expected format : Authorization: Bearer <JWT>
		header := c.GetHeader("Authorization")

		if header == "" {
			c.JSON(http.StatusUnauthorized, response.APIResponse{
				Success: false,
				Error:   domain.ErrMissingAuthHeader.Error(),
			})
			c.Abort()
			return
		}

		// 2. Extract Bearer Token
		// ["Bearer","<token>"]
		parts := strings.Split(header, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {

			c.JSON(http.StatusUnauthorized, response.APIResponse{
				Success: false,
				Error:   domain.ErrInvalidAuthFormat.Error(),
			})
			c.Abort()
			return
		}

		// 3. Validate token
		/*
			- Verifies Signature
			- Checks expiry
			- Verifies algorithm used
			- Parse Claims into *Claims
		*/
		claims, err := jwtManager.ValidateToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, response.APIResponse{
				Success: false,
				Error:   domain.ErrInvalidToken.Error(),
			})
			c.Abort()
			return
		}

		// 4. Extract userID from claims
		userID := claims.UserId
		role := claims.Role

		// 5. Inject userID into context
		c.Set("user_id", userID)
		c.Set("role", role)

		// 6. Continue Request
		c.Next()
	}
}
