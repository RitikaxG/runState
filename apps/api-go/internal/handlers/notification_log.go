package handlers

import (
	"net/http"
	"strconv"

	"github.com/RitikaxG/runState/apps/api-go/internal/http/apperror"
	contextutil "github.com/RitikaxG/runState/apps/api-go/internal/http/context"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/response"
	"github.com/RitikaxG/runState/apps/api-go/internal/service"
	"github.com/gin-gonic/gin"
)

type NotificationLogHandler struct {
	notificationLogService *service.NotificationLogService
}

func NewNotificationLogHandler(s *service.NotificationLogService) *NotificationLogHandler {
	return &NotificationLogHandler{
		notificationLogService: s,
	}
}

func (h *NotificationLogHandler) GetWebsiteNotifications(c *gin.Context) {
	websiteID := c.Param("id")
	if websiteID == "" {
		c.JSON(http.StatusBadRequest, response.APIResponse{
			Success: false,
			Error:   "website id is required",
		})
		return
	}

	userID, err := contextutil.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	limit := 20
	if raw := c.Query("limit"); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	items, err := h.notificationLogService.ListWebsiteNotifications(
		c.Request.Context(),
		websiteID,
		userID,
		limit,
	)
	if err != nil {
		status := apperror.MapErrorToHTTPStatus(err)
		c.JSON(status, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.APIResponse{
		Success: true,
		Data: gin.H{
			"items": items,
		},
	})
}
