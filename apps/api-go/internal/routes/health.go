package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterHealthRouter(r *gin.RouterGroup) {
	health := r.Group("/health")
	health.GET("/", getHealthStatus)
}

func getHealthStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}
