package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/biggboss/pulse/internal/models"
	"github.com/biggboss/pulse/internal/ratelimit"
	"github.com/biggboss/pulse/internal/realtime"
	"github.com/biggboss/pulse/internal/security"
	"github.com/biggboss/pulse/internal/service"
)

// PostsHandler handles GET /api/posts and POST /api/posts
func PostsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		seasonID := r.URL.Query().Get("season_id")
		weekID := r.URL.Query().Get("week_id")
		limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
		offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

		var currentUserID string
		if claims := getOptionalAuth(r); claims != nil {
			currentUserID = claims.UserID
		}

		posts, err := service.GetCommunityPosts(seasonID, weekID, currentUserID, limit, offset)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, posts)

	case http.MethodPost:
		ip := security.GetClientIP(r)
		if !ratelimit.PostLimiter.Allow(ip) {
			writeError(w, http.StatusTooManyRequests, "rate limit exceeded for posting")
			return
		}

		claims := requireAuth(w, r)
		if claims == nil {
			return
		}

		var req models.CreatePostRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json payload")
			return
		}

		post, err := service.CreateCommunityPost(req, claims.UserID, claims.PublicNickname, claims.AvatarColor)
		if err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}

		// Realtime broadcast (with safe public DTO, no private email/UUID)
		if post.WeekID != "" {
			realtime.BroadcastToWeek(post.WeekID, "NEW_COMMUNITY_POST", post)
		} else {
			realtime.BroadcastGlobal("NEW_COMMUNITY_POST", post)
		}

		writeJSON(w, http.StatusCreated, post)

	default:
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

// PostCommentsHandler handles GET and POST on /api/posts/{id}/comments
func PostCommentsHandler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		writeError(w, http.StatusBadRequest, "invalid post id")
		return
	}
	postID := parts[2]

	switch r.Method {
	case http.MethodGet:
		limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
		offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
		comments, err := service.GetCommentsByPost(postID, limit, offset)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, comments)

	case http.MethodPost:
		ip := security.GetClientIP(r)
		if !ratelimit.PostLimiter.Allow(ip) {
			writeError(w, http.StatusTooManyRequests, "rate limit exceeded")
			return
		}

		claims := requireAuth(w, r)
		if claims == nil {
			return
		}

		var req models.CreateCommentRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json payload")
			return
		}

		comment, err := service.CreateCommunityComment(postID, claims.UserID, claims.PublicNickname, claims.AvatarColor, req.Content)
		if err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}

		realtime.BroadcastGlobal("NEW_COMMENT", comment)
		writeJSON(w, http.StatusCreated, comment)

	default:
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

// PostReactHandler handles POST /api/posts/{id}/react
func PostReactHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		writeError(w, http.StatusBadRequest, "invalid post id")
		return
	}
	postID := parts[2]

	claims := requireAuth(w, r)
	if claims == nil {
		return
	}

	var req models.PostReactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	res, err := service.TogglePostReaction(postID, claims.UserID, req.ReactionType)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	realtime.BroadcastGlobal("REACTION_UPDATED", res)
	writeJSON(w, http.StatusOK, res)
}

// ModerationReportHandler handles POST /api/reports
func ModerationReportHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req models.CreateReportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	var userID string
	if claims := getOptionalAuth(r); claims != nil {
		userID = claims.UserID
	}
	deviceID := r.Header.Get("X-Device-ID")

	report, err := service.CreateModerationReport(req, userID, deviceID)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{"success": true, "report_id": report.ID})
}
