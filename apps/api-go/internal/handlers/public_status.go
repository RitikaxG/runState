package handlers

import (
	"net/http"

	"github.com/RitikaxG/runState/apps/api-go/internal/http/apperror"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/response"
	"github.com/RitikaxG/runState/apps/api-go/internal/service"
	"github.com/gin-gonic/gin"
)

type PublicStatusHandler struct {
	publicStatusService *service.PublicStatusService
}

func NewPublicStatusHandler(
	publicStatusService *service.PublicStatusService,
) *PublicStatusHandler {
	return &PublicStatusHandler{
		publicStatusService: publicStatusService,
	}
}

func (h *PublicStatusHandler) GetStatusPageBySlug(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		c.JSON(http.StatusBadRequest, response.APIResponse{
			Success: false,
			Error:   "status page slug is required",
		})
		return
	}

	data, err := h.publicStatusService.GetStatusPageBySlug(
		c.Request.Context(),
		slug,
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
		Data:    data,
		Message: "Public status page fetched successfully",
	})
}
