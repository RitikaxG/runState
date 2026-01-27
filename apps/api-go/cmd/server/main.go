package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/app"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	application, err := app.BuildServer()
	if err != nil {
		log.Fatal(err)
	}

	/* Channels in Go : Helps to communicate between Go Routines
	- send : Put value into the channel
	- receive : Take value from channel
	- Channels can be unbuffered or buffered.

	Buffered vs Unbuffered

	- make(chan T) → unbuffered
	  Send blocks until someone receives

	- make(chan T, 1) → buffered size 1
	  Can hold 1 value without blocking send

	Because OS signals may arrive before <-quit is waiting

	*/
	quit := make(chan os.Signal, 1)

	// whenever Ctrl+C or SIGTERM happens, push the signal into the quit channel.
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	/*
		Server.Run() blocks forever by default

		- If you called it directly, you would never reach <-quit

		- Wrapping it in a goroutine lets it run asynchronously:
			* main goroutine --> waits for quit signal
			* server goroutine --> listens on 3001
	*/
	go func() {
		log.Println("HTTP server running on :3001")
		if err := application.Server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Server Error :", err)
		}
	}()

	/*
		This line blocks the main goroutine until a value arrives in the channel
		The value arrives only when Ctrl+C or SIGTERM is triggered

		So the main goroutine is essentially “waiting for shutdown”
	*/
	<-quit
	signal.Stop(quit)
	log.Println("Shutting down...")

	// 1. Stop HTTP first ( Graceful HTTP shutdown )
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := application.Server.Shutdown(ctx); err != nil {
		log.Println("Http shutdown error", err)
	}

	// 2. Stop Background Workers
	// Cancel app context ( Workers will stop here )
	application.Cancel()

	// Cleanup
	if application.DB != nil {
		application.DB.Close()
	}

	if application.Redis != nil {
		application.Redis.Close()
	}

	log.Println("Shutdown complete")
}
