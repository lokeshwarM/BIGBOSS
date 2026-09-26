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
	"github.com/joho/godotenv"
)

// corsMiddleware enables cross-origin requests with configurable origins
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow configured origins or fallback to '*' in dev
		allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
		if allowedOrigins == "" {
			allowedOrigins = "*"
		}

		origin := r.Header.Get("Origin")
		if origin != "" && allowedOrigins != "*" {
			// Check if the origin is in the allowed list
			for _, o := range strings.Split(allowedOrigins, ",") {
				if strings.TrimSpace(o) == origin {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					break
				}
			}
		} else {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigins)
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Device-ID, X-Admin-Key")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Load .env file — try several locations for dev convenience
	envPaths := []string{".env", "../.env", "../../.env", "../../../.env"}
	loaded := false
	for _, p := range envPaths {
		if err := godotenv.Load(p); err == nil {
			log.Printf("ℹ️  Loaded environment from %s", p)
			loaded = true
			break
		}
	}
	if !loaded {
		log.Println("ℹ️  No .env file found — using system environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Println("🚀 Starting BIGBOSS Community API Server...")

	// 1. Initialize Database (PostgreSQL via Neon)
	if err := database.InitDB(); err != nil {
		log.Printf("DB Init error: %v", err)
	}

	// 2. Initialize Service Layer (DB-first with in-memory fallback)
	service.InitStore()

	// 3. Initialize WebSocket Hub
	realtime.InitHub()

	// 4. Setup Routes
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/api/health", api.HealthCheck)

	// ── Shows & Seasons ──────────────────────────────────────────
	showsHandler := func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api/shows" || r.URL.Path == "/api/shows/" {
			api.GetShows(w, r)
			return
		}
		// /api/shows/{slug}/seasons/{num}
		if strings.Contains(r.URL.Path, "/seasons/") {
			api.GetSeasonDetail(w, r)
			return
		}
		// /api/shows/{slug}/seasons
		if strings.HasSuffix(r.URL.Path, "/seasons") || strings.HasSuffix(r.URL.Path, "/seasons/") {
			api.GetSeasonsByShow(w, r)
			return
		}
		api.GetShowBySlug(w, r)
	}
	mux.HandleFunc("/api/shows", showsHandler)
	mux.HandleFunc("/api/shows/", showsHandler)

	// ── Polls & Voting ───────────────────────────────────────────
	mux.HandleFunc("/api/polls/vote", api.CastVote)
	mux.HandleFunc("/api/polls/", api.GetPollByID)

	// ── Chat ─────────────────────────────────────────────────────
	mux.HandleFunc("/api/chat/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			api.PostChat(w, r)
		} else {
			api.GetChat(w, r)
		}
	})

	// ── Device ───────────────────────────────────────────────────
	mux.HandleFunc("/api/device/register", api.RegisterDevice)

	// ── Admin ─────────────────────────────────────────────────────
	// All admin endpoints require X-Admin-Key header
	mux.HandleFunc("/api/admin/data", api.AdminGetAllDataHandler)
	mux.HandleFunc("/api/admin/shows", api.AdminCreateShowHandler)
	mux.HandleFunc("/api/admin/seasons", api.AdminCreateSeasonHandler)
	mux.HandleFunc("/api/admin/contestants", api.AdminContestantsHandler)
	mux.HandleFunc("/api/admin/contestants/", api.AdminContestantByIDHandler)
	mux.HandleFunc("/api/admin/polls", api.AdminPollsHandler)
	mux.HandleFunc("/api/admin/polls/", api.AdminPollByIDHandler)

	// ── WebSocket ─────────────────────────────────────────────────
	mux.HandleFunc("/ws", realtime.ServeWs)

	handler := corsMiddleware(mux)

	log.Printf("⚡ BIGBOSS Community Server listening on port :%s", port)
	log.Printf("👉 REST API  → http://localhost:%s/api", port)
	log.Printf("👉 WebSocket → ws://localhost:%s/ws", port)

	if database.IsConnected() {
		log.Println("📦 Data source: PostgreSQL (Neon)")
	} else {
		log.Println("⚠️  Data source: In-Memory (PostgreSQL not connected)")
	}

	adminSecret := os.Getenv("ADMIN_SECRET")
	if adminSecret == "" {
		log.Println("⚠️  ADMIN_SECRET not set — admin endpoints are UNPROTECTED (dev mode only)")
	} else {
		log.Println("🔒 Admin endpoints protected by ADMIN_SECRET key")
	}

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server terminated: %v", err)
	}
}
