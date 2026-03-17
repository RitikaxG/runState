package handlers

import (
	"net/http"
	"strconv"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/dto"
	"github.com/RitikaxG/runState/apps/api-go/internal/service"
	"github.com/gin-gonic/gin"
)

type IncidentHandler struct {
	incidentService *service.IncidentService
}

func NewIncidentHandler(incidentService *service.IncidentService) *IncidentHandler {
	return &IncidentHandler{
		incidentService: incidentService,
	}
}

func (h *IncidentHandler) GetWebsiteIncidents(c *gin.Context) {
	websiteID := c.Param("id")

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	requesterUserID, ok := userIDValue.(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user context"})
		return
	}

	limit := 20
	if rawLimit := c.Query("limit"); rawLimit != "" {
		parsed, err := strconv.Atoi(rawLimit)
		if err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	incidents, err := h.incidentService.ListWebsiteIncidents(
		c.Request.Context(),
		websiteID,
		requesterUserID,
		limit,
	)
	if err != nil {
		switch err {
		case domain.ErrForbidden:
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch incidents"})
		}
		return
	}

	c.JSON(http.StatusOK, dto.ListIncidentsResponse{
		Incidents: incidents,
	})
}
