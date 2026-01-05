package handlers

import (
	"net/http"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/dto"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/apperror"
	contextutil "github.com/RitikaxG/runState/apps/api-go/internal/http/context"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/response"
	"github.com/RitikaxG/runState/apps/api-go/internal/service"
	"github.com/gin-gonic/gin"
)

/* 1. Define a handler struct

This indicates WebsiteHandler has a WebsiteService.
Handler depends on WebsiteService, it stores a reference to the WebsiteService


WebsiteHandler represents the HTTP layer for website-related APIs.

Why is this struct needed?

In Go, handlers are not classes.
To give handlers access to services (business logic),
we store required dependencies INSIDE a struct.

This is Dependency Injection:

- WebsiteHandler "depends on" WebsiteService
- Instead of creating the service inside the handler,
  we RECEIVE it from outside and STORE it here

This makes:
- code modular
- code testable
- responsibilities clearly separated
*/

type WebsiteHandler struct {
	// websiteService is a dependency required by this handler
	// It is a POINTER so the same service instance is shared
	websiteService *service.WebsiteService
}

// 2. Add a Constructor for WebsiteHandler
/*

1. Creates a WebsiteHandler struct
2. Assigns the passed service to the struct field
3. Returns a pointer to the handler


NewWebsiteHandler wires dependencies together.

What this function does:

1. Receives an already-created WebsiteService
2. Creates a WebsiteHandler
3. Stores the service inside the handler
4. Returns a pointer to the handler

Why do we need this?

- Go has no constructors
- "NewX" functions are the standard way to:
  - initialize structs
  - inject dependencies
*/

func NewWebsiteHandler(ws *service.WebsiteService) *WebsiteHandler {
	return &WebsiteHandler{
		websiteService: ws,
	}
}

// Handler Fn
func GetWebsites(c *gin.Context) { // gin.Context : single HTTP request + response ( lives only during that request )
	c.JSON(http.StatusOK, gin.H{
		"message": "List all websites",
	})
}

/*
Go automtically :
1. Parses JSON
2. runs validation tags (validate:"")..
*/

/*
CreateWebsite is a METHOD of WebsiteHandler.

(h *WebsiteHandler) is called a method receiver.

Think of it as:
- `h` == `this` (from TypeScript / Java)
- h points to the handler instance created by NewWebsiteHandler

Because h contains websiteService,
this method can call business logic via the service layer.
*/
func (h *WebsiteHandler) CreateWebsite(c *gin.Context) {
	var body dto.CreateWebsiteRequest // Declaring a Go struct that defines what JSON you expect

	/* if err := c.ShouldBindJSON(&body); err != nil
	What happens here internally

		Gin:

		1. Reads request body
		2. Parses JSON
		3. Matches JSON fields to struct tags
		4. Validates rules (binding:"required")
		5. Populates body

		If anything fails, err != nil.

		Examples of failure:

		1. Invalid JSON
		2. Missing required fields
		3. Wrong data types
		4. Validation errors
	*/

	// 1. Parse & Validate JSON object
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, response.APIResponse{
			Success: false,
			Error:   "invalid request body",
		})
		return // Prevents handler from continuing
	}

	/* 2. Extract Context from HTTP request

	- Context carries request cancellation, deadlines, tracing info.
	- If client disconnects -> DB query can be cancelled

	*/
	ctx := c.Request.Context()

	/*
		Call the SERVICE layer.

		Important concept:
		- Handler does NOT contain business rules
		- Handler delegates work to WebsiteService
	*/

	/* 3. Call SERVICE layer (business + DB logic)
	- Service now talks to repository, returns full domain entity.
	*/

	// 1. Get user_id for authentication
	userID, err := contextutil.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	// 2. Pass it to service
	website, err := h.websiteService.CreateWebsite(ctx, userID, body.URL)

	if err != nil {
		// Convert Domain Error -> HTTP Status
		status := apperror.MapErrorToHTTPStatus(err)
		c.JSON(status, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	/* 4. Return response using domain entity
	- DB now generate data.
	- API response should reflect persistent data
	*/
	c.JSON(http.StatusCreated, response.APIResponse{
		Success: true,
		Message: "website successfully created",
		Data:    website,
	})
}

func (h *WebsiteHandler) DeleteWebsite(c *gin.Context) {
	// 1. Extract websiteID from Params
	websiteID := c.Param("id")
	if websiteID == "" {
		c.JSON(http.StatusBadRequest, response.APIResponse{
			Success: false,
			Error:   "website id is required",
		})
		return
	}

	// 2. Get userID from context
	userID, err := contextutil.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   domain.ErrUnauthorized.Error(),
		})
		return
	}

	// 3. Get role from context
	role, err := contextutil.GetUserRole(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.APIResponse{
			Success: false,
			Error:   domain.ErrUnauthorized.Error(),
		})
		return
	}

	// 4. Call service to delete
	err = h.websiteService.DeleteWebsite(c.Request.Context(), userID, role, websiteID)
	if err != nil {
		status := apperror.MapErrorToHTTPStatus(err)
		c.JSON(status, response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	// 5. Return Success
	c.JSON(http.StatusOK, response.APIResponse{
		Success: true,
		Message: "Website Successfully deleted",
	})
}
