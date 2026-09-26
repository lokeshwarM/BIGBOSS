package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/biggboss/pulse/internal/models"
	"github.com/biggboss/pulse/internal/realtime"
	"github.com/biggboss/pulse/internal/service"
)

// Helper to write JSON response
func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// HealthCheck handles /api/health
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status":  "healthy",
		"service": "biggboss-pulse-api",
		"engine":  "Go 1.22",
	})
}

// GetShows handles GET /api/shows
func GetShows(w http.ResponseWriter, r *http.Request) {
	shows := service.GlobalStore.GetShows()
	writeJSON(w, http.StatusOK, shows)
}

// GetShowBySlug handles GET /api/shows/{slug}
func GetShowBySlug(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}
	slug := parts[2]
	show, err := service.GlobalStore.GetShowBySlug(slug)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	writeJSON(w, http.StatusOK, show)
}

// GetActivePolls handles GET /api/polls/active
func GetActivePolls(w http.ResponseWriter, r *http.Request) {
	polls := service.GlobalStore.GetActivePolls()
	writeJSON(w, http.StatusOK, polls)
}

// GetPollByID handles GET /api/polls/{id}?device_id=xyz
func GetPollByID(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}
	weekID := parts[2]
	week, err := service.GlobalStore.GetWeekByID(weekID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	deviceID := r.URL.Query().Get("device_id")
	hasVotedToday, votedForID := false, ""
	if deviceID != "" {
		hasVotedToday, votedForID = service.GlobalStore.HasVotedToday(weekID, deviceID)
	}

	response := map[string]any{
		"week":            week,
		"has_voted_today": hasVotedToday,
		"voted_for_id":    votedForID,
	}

	writeJSON(w, http.StatusOK, response)
}

// CastVote handles POST /api/polls/vote
func CastVote(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.VoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json payload", http.StatusBadRequest)
		return
	}

	if req.WeekID == "" || req.ContestantID == "" || req.DeviceID == "" {
		http.Error(w, "week_id, contestant_id, and device_id are required", http.StatusBadRequest)
		return
	}

	res, err := service.GlobalStore.CastVote(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Broadcast live vote tally update via WebSocket to all connected mobile clients
	realtime.BroadcastEvent("VOTE_UPDATE", map[string]any{
		"week_id":     req.WeekID,
		"total_votes": res.TotalVotes,
		"standings":   res.Standings,
	})

	writeJSON(w, http.StatusOK, res)
}

// GetWeekArchive handles GET /api/polls/{showSlug}/archive
func GetWeekArchive(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}
	showSlug := parts[2]
	archive := service.GlobalStore.GetWeekArchive(showSlug)
	writeJSON(w, http.StatusOK, archive)
}

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

// RegisterDevice handles POST /api/device/register
func RegisterDevice(w http.ResponseWriter, r *http.Request) {
	var req models.DeviceAccount
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json payload", http.StatusBadRequest)
		return
	}

	if req.DeviceID == "" {
		http.Error(w, "device_id is required", http.StatusBadRequest)
		return
	}

	if req.Nickname == "" {
		req.Nickname = "BB_Fan"
	}
	if req.AvatarColor == "" {
		req.AvatarColor = "#F59E0B"
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success":   true,
		"device_id": req.DeviceID,
		"nickname":  req.Nickname,
		"color":     req.AvatarColor,
		"email":     req.Email,
	})
}
