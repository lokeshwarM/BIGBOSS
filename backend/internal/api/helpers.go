package api

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"
)

// writeJSON writes a JSON response with the given status code
func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// writeError writes a structured JSON error response
func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]any{"error": msg})
}

// checkAdminKey validates X-Admin-Key header against ADMIN_SECRET env var
func checkAdminKey(w http.ResponseWriter, r *http.Request) bool {
	secret := os.Getenv("ADMIN_SECRET")
	if secret == "" {
		// In dev mode without a secret configured, allow access but warn
		return true
	}
	provided := r.Header.Get("X-Admin-Key")
	if provided == "" {
		// Also check Authorization: Bearer <key>
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			provided = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}
	if provided != secret {
		writeError(w, http.StatusUnauthorized, "admin authentication required")
		return false
	}
	return true
}
