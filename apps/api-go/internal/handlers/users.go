package handlers

import (
	"net/http"

	"github.com/RitikaxG/runState/apps/api-go/internal/dto"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/response"
	"github.com/RitikaxG/runState/apps/api-go/internal/service"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService *service.UserService
	authService *service.AuthService
}

func NewUserHandler(
	us *service.UserService,
	as *service.AuthService,
) *UserHandler {
	return &UserHandler{
		userService: us,
		authService: as,
	}
}

func (h *UserHandler) Signup(c *gin.Context) {
	var body dto.SignupRequest

	// 1. Bind JSON body to DTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	// 2. Call Service layer
	user, err := h.userService.Signup(
		c.Request.Context(),
		body.Email,
		body.Password,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	// 3. Prepare Response DTO
	signupResp := dto.SignupResponse{
		ID:    user.ID,
		Email: user.Email,
	}

	// 4. Send success request
	c.JSON(http.StatusCreated, response.APIResponse{
		Success: true,
		Data:    signupResp,
		Message: "User successfully created",
	})
}

func (h *UserHandler) Signin(c *gin.Context) {
	var body dto.SigninRequest

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	// Authenticate user ( identity )
	user, err := h.userService.Authenticate(
		c.Request.Context(),
		body.Email,
		body.Password,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	// Issue Credentials ( access + refresh )
	tokenPair, err := h.authService.Signin(
		c.Request.Context(),
		user,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	signinResponse := dto.SigninResponse{
		AccesToken:   tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
	}

	c.JSON(http.StatusOK, response.APIResponse{
		Success: true,
		// map Key -> Value
		Data:    signinResponse,
		Message: "Signin successful",
	})
}

func (h *UserHandler) ListUsers(c *gin.Context) {
	users, err := h.userService.ListUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.APIResponse{
		Success: true,
		Data:    users,
	})

}
