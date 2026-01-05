package contextutil

import (
	"errors"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/gin-gonic/gin"
)

func GetUserID(c *gin.Context) (string, error) {
	userID, ok := c.Get("user_id")
	if !ok {
		return "", errors.New("user not found in context")
	}

	idStr, ok := userID.(string)
	if !ok {
		return "", errors.New("user_id in context is not a string")
	}

	return idStr, nil
}

func GetUserRole(c *gin.Context) (domain.Role, error) {
	role, ok := c.Get("role")
	if !ok {
		return "", errors.New("role not found in context")
	}

	userRole, ok := role.(domain.Role)
	if !ok {
		return "", errors.New("invalid role type in context")
	}
	return userRole, nil
}
