package routes

// Fetching an External Package in Go
// go get github.com/gin-gonic/gin ( Downloads gin and its dependencies )
// updates go.mod
import (
	"github.com/RitikaxG/runState/apps/api-go/internal/auth"
	"github.com/RitikaxG/runState/apps/api-go/internal/handlers"
	"github.com/RitikaxG/runState/apps/api-go/internal/http/middleware"
	"github.com/gin-gonic/gin"
)

// You need to pass a pointer to WebsiteHandler struct to access CreateWebsite method
func RegisterWebsitesRouter(
	r *gin.RouterGroup,
	handler *handlers.WebsiteHandler,
	jwtManager *auth.JWTManager,
) { // gin.RouterGroup : organises the routes
	protected := r.Group("/websites")
	protected.Use(middleware.AuthMiddleware(jwtManager))
	protected.Use(middleware.RequireRole("ADMIN", "USER")) // User + Admin Allowed

	protected.GET("/", handlers.GetWebsites)
	protected.POST("/", handler.CreateWebsite)

	// Only Owner or Admin can delete
	protected.DELETE("/:id", handler.DeleteWebsite)
}
