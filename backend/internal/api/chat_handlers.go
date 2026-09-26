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
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}
	weekID := parts[2]
	messages := service.GlobalStore.GetChatMessages(weekID)
	writeJSON(w, http.StatusOK, messages)
}

// PostChat handles POST /api/chat/{weekId}
func PostChat(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}
	weekID := parts[2]

	var req models.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json payload", http.StatusBadRequest)
		return
	}
	req.WeekID = weekID

	msg, err := service.GlobalStore.AddChatMessage(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error": err.Error(),
		})
		return
	}

	// Broadcast message via WebSocket
	realtime.BroadcastEvent("NEW_CHAT_MESSAGE", msg)

	writeJSON(w, http.StatusCreated, msg)
}
