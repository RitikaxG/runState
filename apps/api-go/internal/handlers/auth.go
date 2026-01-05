package handlers

import (
	"net/http"

	"github.com/RitikaxG/runState/apps/api-go/internal/dto"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/response"
	"github.com/RitikaxG/runState/apps/api-go/internal/service"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(as *service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: as,
	}
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	var req dto.RefreshRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	tokenPair, err := h.authService.Refresh(
		c.Request.Context(),
		req.RefreshToken,
	)

	if err != nil {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	refreshResponse := dto.RefreshResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
	}

	c.JSON(http.StatusOK, response.APIResponse{
		Success: true,
		Data:    refreshResponse,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	var body dto.LogoutRequest

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	if err := h.authService.Logout(
		c.Request.Context(),
		body.RefreshToken,
	); err != nil {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.APIResponse{
		Success: true,
		Message: "Logout Successful",
	})
}
