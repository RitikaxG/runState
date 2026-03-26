package handlers

import (
	"net/http"
	"strconv"

	"github.com/RitikaxG/runState/apps/api-go/internal/dto"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/apperror"
	contextutil "github.com/RitikaxG/runState/apps/api-go/internal/http/context"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/response"
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

	role, err := contextutil.GetUserRole(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
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
		userID,
		string(role),
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
		Data: dto.ListIncidentsResponse{
			Incidents: incidents,
		},
		Message: "Website incidents fetched successfully",
	})
}
