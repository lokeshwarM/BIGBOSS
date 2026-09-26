package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/biggboss/pulse/internal/api"
	"github.com/biggboss/pulse/internal/database"
	"github.com/biggboss/pulse/internal/realtime"
	"github.com/biggboss/pulse/internal/service"
)

// corsMiddleware wraps handlers to enable cross-origin requests
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Device-ID")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("🚀 Starting BiggBossPulse Go Engine...")

	// 1. Initialize Database
	if err := database.InitDB(); err != nil {
		log.Printf("DB Init note: %v", err)
	}

	// 2. Initialize In-Memory Store
	service.InitStore()

	// 3. Initialize WebSocket Hub
	realtime.InitHub()

	// 4. Setup Routes
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/api/health", api.HealthCheck)

	// Shows
	mux.HandleFunc("/api/shows", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api/shows" {
			api.GetShows(w, r)
		} else {
			api.GetShowBySlug(w, r)
		}
	})

	// Polls
	mux.HandleFunc("/api/polls/active", api.GetActivePolls)
	mux.HandleFunc("/api/polls/vote", api.CastVote)
	mux.HandleFunc("/api/polls/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/archive") {
			api.GetWeekArchive(w, r)
		} else {
			api.GetPollByID(w, r)
		}
	})

	// Chat
	mux.HandleFunc("/api/chat/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			api.PostChat(w, r)
		} else {
			api.GetChat(w, r)
		}
	})

	// Anonymous Device Registration
	mux.HandleFunc("/api/device/register", api.RegisterDevice)

	// WebSocket Live Chat and Vote Stream
	mux.HandleFunc("/ws", realtime.ServeWs)

	handler := corsMiddleware(mux)

	log.Printf("⚡ BiggBossPulse Server listening on port :%s", port)
	log.Printf("👉 REST API available at http://localhost:%s/api", port)
	log.Printf("👉 WebSocket Stream available at ws://localhost:%s/ws", port)

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server terminated: %v", err)
	}
}
