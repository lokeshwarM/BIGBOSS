package api

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/biggboss/pulse/internal/auth"
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

// requireAuth ensures request has a valid authenticated JWT; writes 401 if missing
func requireAuth(w http.ResponseWriter, r *http.Request) *auth.AuthClaims {
	claims := getOptionalAuth(r)
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "authentication required for persistent community participation")
		return nil
	}
	return claims
}

// getOptionalAuth extracts claims from request context or token header without rejecting
func getOptionalAuth(r *http.Request) *auth.AuthClaims {
	if claims := auth.GetUserFromContext(r.Context()); claims != nil {
		return claims
	}
	tokenStr := auth.ExtractTokenFromRequest(r)
	if tokenStr != "" {
		if claims, err := auth.ValidateToken(tokenStr); err == nil {
			return claims
		}
	}
	return nil
}

// requireAdmin enforces administrator authorization
// Checks JWT role=='admin' OR valid X-Admin-Key / Bearer ADMIN_SECRET
func requireAdmin(w http.ResponseWriter, r *http.Request) bool {
	// 1. Check authenticated JWT role
	if claims := getOptionalAuth(r); claims != nil {
		if claims.Role == "admin" {
			return true
		}
	}

	// 2. Check X-Admin-Key or ADMIN_SECRET Bearer header
	secret := os.Getenv("ADMIN_SECRET")
	if secret != "" {
		provided := r.Header.Get("X-Admin-Key")
		if provided == "" {
			authHeader := r.Header.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				provided = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}
		if provided == secret {
			return true
		}
	}

	// 3. In development mode, allow localhost admin operations seamlessly
	if os.Getenv("ENV") == "development" {
		return true
	}

	writeError(w, http.StatusForbidden, "administrator authorization required")
	return false
}
