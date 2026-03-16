package handlers

import (
	"net/http"
	"strconv"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
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
	if limit > 100 {
		limit = 100
	}

	userID, err := contextutil.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	roleValue, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   "role not found in context",
		})
		return
	}

	role, ok := roleValue.(string)
	if !ok || role == "" {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   "invalid role in context",
		})
		return
	}

	checks, err := h.websiteTicksService.GetWebsiteChecks(
		c.Request.Context(),
		userID,
		role,
		websiteID,
		limit,
	)
	if err != nil {
		switch err {
		case domain.ErrForbidden:
			c.JSON(http.StatusForbidden, response.APIResponse{
				Success: false,
				Error:   "you are not allowed to access this website",
			})
			return
		default:
			c.JSON(http.StatusInternalServerError, response.APIResponse{
				Success: false,
				Error:   err.Error(),
			})
			return
		}
	}

	items := make([]dto.WebsiteCheckItem, 0, len(checks))
	for _, tick := range checks {
		items = append(items, dto.WebsiteCheckItem{
			ID:             tick.ID,
			WebsiteID:      tick.WebsiteID,
			RegionID:       tick.RegionID,
			Status:         string(tick.Status),
			ResponseTimeMs: tick.ResponseTimeMs,
			CreatedAt:      tick.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, response.APIResponse{
		Success: true,
		Message: "website checks fetched successfully",
		Data: dto.ListWebsiteChecksResponse{
			Checks: items,
		},
	})
}

func (h *WebsiteTicksHandler) GetWebsiteResponseTimes(c *gin.Context) {
	websiteID := c.Param("id")
	if websiteID == "" {
		c.JSON(http.StatusBadRequest, response.APIResponse{
			Success: false,
			Error:   "website id is required",
		})
		return
	}

	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}
	if limit > 500 {
		limit = 500
	}

	userID, err := contextutil.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	roleValue, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   "role not found in context",
		})
		return
	}

	role, ok := roleValue.(string)
	if !ok || role == "" {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   "invalid role in context",
		})
		return
	}

	points, err := h.websiteTicksService.GetResponseTimes(
		c.Request.Context(),
		userID,
		role,
		websiteID,
		limit,
	)
	if err != nil {
		switch err {
		case domain.ErrForbidden:
			c.JSON(http.StatusForbidden, response.APIResponse{
				Success: false,
				Error:   "you are not allowed to access this website",
			})
			return
		default:
			c.JSON(http.StatusInternalServerError, response.APIResponse{
				Success: false,
				Error:   err.Error(),
			})
			return
		}
	}

	c.JSON(http.StatusOK, response.APIResponse{
		Success: true,
		Message: "website response times fetched successfully",
		Data: dto.WebsiteResponseTimesResponse{
			Points: points,
		},
	})
}
