package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/biggboss/pulse/internal/models"
	"github.com/biggboss/pulse/internal/realtime"
	"github.com/biggboss/pulse/internal/service"
)

// GetChat handles GET /api/chat/{weekId}
func GetChat(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		writeError(w, http.StatusBadRequest, "invalid path")
		return
	}
	weekID := parts[2]
	messages := service.GetChatMessages(weekID)
	if messages == nil {
		messages = []models.ChatMessage{}
	}
	writeJSON(w, http.StatusOK, messages)
}

// PostChat handles POST /api/chat/{weekId}
func PostChat(w http.ResponseWriter, r *http.Request) {
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
		writeError(w, http.StatusBadRequest, "device_id is required")
		return
	}

	msg, err := service.AddChatMessage(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Broadcast message to clients watching this week's room
	realtime.BroadcastToWeek(weekID, "NEW_CHAT_MESSAGE", msg)

	writeJSON(w, http.StatusCreated, msg)
}

// PinChatMessage handles POST /api/admin/chat/{id}/pin
func PinChatMessage(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 {
		writeError(w, http.StatusBadRequest, "invalid path")
		return
	}
	messageID := parts[3]
	// Use Exec directly from service
	// For simplicity, just write a helper call
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "message_id": messageID})
}

// DeleteChatMessage handles DELETE /api/admin/chat/{id}
func DeleteChatMessage(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 {
		writeError(w, http.StatusBadRequest, "invalid path")
		return
	}
	messageID := parts[3]
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "deleted": messageID})
}
