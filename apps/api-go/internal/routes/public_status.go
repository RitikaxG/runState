package routes

// Fetching an External Package in Go
// go get github.com/gin-gonic/gin ( Downloads gin and its dependencies )
// updates go.mod
import (
	"github.com/RitikaxG/runState/apps/api-go/internal/handlers"
	"github.com/gin-gonic/gin"
)

// You need to pass a pointer to WebsiteHandler struct to access CreateWebsite method
func RegisterPublicStatusRouter(
	r *gin.RouterGroup,
	publicStatusHandler *handlers.PublicStatusHandler,
) { // gin.RouterGroup : organises the routes
	public := r.Group("/public")
	public.GET("/status-pages/:slug", publicStatusHandler.GetStatusPageBySlug)
}
