package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/biggboss/pulse/internal/models"
	"github.com/biggboss/pulse/internal/ratelimit"
	"github.com/biggboss/pulse/internal/realtime"
	"github.com/biggboss/pulse/internal/security"
	"github.com/biggboss/pulse/internal/service"
)

// GetChat handles GET /api/chat/{weekId}
// Returns live ephemeral discussion for guests and active visitors
func GetChat(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		writeError(w, http.StatusBadRequest, "invalid path")
		return
	}
	weekID := parts[2]
	messages := service.GetEphemeralChatMessages(weekID)
	writeJSON(w, http.StatusOK, messages)
}

// PostChat handles POST /api/chat/{weekId}
// Allows immediate anonymous guest participation in the live room (ephemeral, not permanent history)
func PostChat(w http.ResponseWriter, r *http.Request) {
	ip := security.GetClientIP(r)
	if !ratelimit.PostLimiter.Allow(ip) {
		writeError(w, http.StatusTooManyRequests, "chat rate limit exceeded")
		return
	}

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		writeError(w, http.StatusBadRequest, "invalid path")
		return
	}
	weekID := parts[2]

	var req models.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}
	req.WeekID = weekID

	if req.DeviceID == "" {
		req.DeviceID = ip
	}

	// If authenticated user is posting to live chat, use their public nickname
	if claims := getOptionalAuth(r); claims != nil {
		req.Nickname = claims.PublicNickname
		req.AvatarColor = claims.AvatarColor
	}

	msg, err := service.AddEphemeralChatMessage(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Broadcast message to clients watching this week's live room
	realtime.BroadcastToWeek(weekID, "NEW_CHAT_MESSAGE", msg)

	writeJSON(w, http.StatusCreated, msg)
}

// PinChatMessage handles POST /api/admin/chat/{weekId}/{id}/pin
func PinChatMessage(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 5 {
		writeError(w, http.StatusBadRequest, "path must be /api/admin/chat/{weekId}/{id}/pin")
		return
	}
	weekID := parts[3]
	messageID := parts[4]

	if err := service.PinEphemeralChatMessage(weekID, messageID); err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	realtime.BroadcastToWeek(weekID, "CHAT_MESSAGE_PINNED", map[string]string{"message_id": messageID})
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "pinned": messageID})
}

// DeleteChatMessage handles DELETE /api/admin/chat/{weekId}/{id}
func DeleteChatMessage(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 5 {
		writeError(w, http.StatusBadRequest, "path must be /api/admin/chat/{weekId}/{id}")
		return
	}
	weekID := parts[3]
	messageID := parts[4]

	if err := service.DeleteEphemeralChatMessage(weekID, messageID); err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	realtime.BroadcastToWeek(weekID, "CHAT_MESSAGE_DELETED", map[string]string{"message_id": messageID})
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "deleted": messageID})
}
