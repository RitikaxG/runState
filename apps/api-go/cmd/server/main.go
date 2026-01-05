package main

import (
	"github.com/RitikaxG/runState/apps/api-go/internal/app"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	server := app.BuildServer()
	/*
		What happens at this line ?
		Step-by-step execution

		1️⃣ Pass the server (r) into routes package
		2️⃣ Create /api/v1 group
		3️⃣ Inside that group, register /websites routes
		4️⃣ Attach handlers (getWebsites, createWebsite)
	*/

	// Start listening at 3001
	server.Run(":3001")
}
