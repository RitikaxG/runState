package handlers

import (
	"net/http"
	"strconv"

	"github.com/RitikaxG/runState/apps/api-go/internal/dto"
	contextutil "github.com/RitikaxG/runState/apps/api-go/internal/http/context"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/response"
	"github.com/RitikaxG/runState/apps/api-go/internal/service"
	"github.com/gin-gonic/gin"
)

type WebsiteTicksHandler struct {
	websiteTicksService *service.WebsiteTicksService
}

func NewWebsiteTicksHandler(
	websiteTicksService *service.WebsiteTicksService,
) *WebsiteTicksHandler {
	return &WebsiteTicksHandler{
		websiteTicksService: websiteTicksService,
	}
}

func (h *WebsiteTicksHandler) GetWebsiteChecks(c *gin.Context) {
	websiteID := c.Param("id")
	if websiteID == "" {
		c.JSON(http.StatusBadRequest, response.APIResponse{
			Success: false,
			Error:   "website id is required",
		})
		return
	}

	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	userID, err := contextutil.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	checks, err := h.websiteTicksService.GetWebsiteChecks(
		c.Request.Context(),
		userID,
		websiteID,
		limit,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	responses := make([]dto.WebsiteTicksResponse, 0, len(checks))

	for _, tick := range checks {
		responses = append(responses, dto.WebsiteTicksResponse{
			ID:             tick.ID,
			WebsiteID:      tick.WebsiteID,
			RegionID:       tick.RegionID,
			Status:         string(tick.Status),
			ResponseTimeMs: tick.ResponseTimeMs,
			CheckedAt:      tick.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, response.APIResponse{
		Success: true,
		Message: "website checks fetched successfully",
		Data:    responses,
	})
}
