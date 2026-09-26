package api

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/biggboss/pulse/internal/auth"
	"github.com/biggboss/pulse/internal/models"
	"github.com/biggboss/pulse/internal/ratelimit"
	"github.com/biggboss/pulse/internal/security"
	"github.com/biggboss/pulse/internal/service"
)

// GoogleLoginHandler handles POST /api/auth/google
func GoogleLoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	ip := security.GetClientIP(r)
	if !ratelimit.AuthLimiter.Allow(ip) {
		writeError(w, http.StatusTooManyRequests, "rate limit exceeded. please wait a moment.")
		return
	}

	var req models.GoogleLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	res, err := service.AuthenticateWithGoogle(req)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	// Set secure HTTP-only cookie as well for web convenience
	http.SetCookie(w, &http.Cookie{
		Name:     "bb_auth_token",
		Value:    res.Token,
		Path:     "/",
		MaxAge:   7 * 24 * 3600,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   strings.EqualFold(os.Getenv("ENV"), "production"),
	})

	writeJSON(w, http.StatusOK, res)
}

// DevLoginHandler handles POST /api/auth/dev-login (active in development or for quick sign-in)
func DevLoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	ip := security.GetClientIP(r)
	if !ratelimit.AuthLimiter.Allow(ip) {
		writeError(w, http.StatusTooManyRequests, "rate limit exceeded")
		return
	}

	var req models.DevLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	res, err := service.DevLogin(req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "bb_auth_token",
		Value:    res.Token,
		Path:     "/",
		MaxAge:   7 * 24 * 3600,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   false,
	})

	writeJSON(w, http.StatusOK, res)
}

// GetMeHandler handles GET /api/auth/me
func GetMeHandler(w http.ResponseWriter, r *http.Request) {
	claims := requireAuth(w, r)
	if claims == nil {
		return
	}

	profile, err := service.GetUserProfile(claims.UserID)
	if err != nil {
		// Fallback to token claims if DB unavailable
		profile = &models.UserProfileDTO{
			ID:             claims.UserID,
			Email:          claims.Email,
			Role:           claims.Role,
			PublicNickname: claims.PublicNickname,
			AvatarColor:    claims.AvatarColor,
		}
	}

	writeJSON(w, http.StatusOK, profile)
}

// UpdateProfileHandler handles PUT /api/auth/profile
func UpdateProfileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPatch {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	claims := requireAuth(w, r)
	if claims == nil {
		return
	}

	var req models.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	updated, err := service.UpdateUserProfile(claims.UserID, req.PublicNickname, req.AvatarColor)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Re-issue updated token
	token, _ := auth.GenerateToken(updated.ID, updated.Email, updated.Role, updated.PublicNickname, updated.AvatarColor)
	writeJSON(w, http.StatusOK, map[string]any{
		"token": token,
		"user":  updated,
	})
}

// LogoutHandler handles POST /api/auth/logout
func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "bb_auth_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "message": "logged out"})
}
