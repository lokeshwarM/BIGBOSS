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

// GetPollByID handles GET /api/polls/{id}?device_id=xyz
func GetPollByID(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		writeError(w, http.StatusBadRequest, "invalid path")
		return
	}
	weekID := parts[2]
	week, err := service.GetWeekByID(weekID)
	if err != nil {
		writeError(w, http.StatusNotFound, "poll not found")
		return
	}

	deviceID := r.URL.Query().Get("device_id")
	hasVotedToday, votedForID := false, ""
	if deviceID != "" {
		hasVotedToday, votedForID = service.HasVotedToday(weekID, deviceID)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"week":            week,
		"has_voted_today": hasVotedToday,
		"voted_for_id":    votedForID,
	})
}

// CastVote handles POST /api/polls/vote
func CastVote(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	ip := security.GetClientIP(r)
	if !ratelimit.VoteLimiter.Allow(ip) {
		writeError(w, http.StatusTooManyRequests, "voting rate limit exceeded. please wait a few seconds.")
		return
	}

	var req models.VoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	if req.WeekID == "" || req.ContestantID == "" || req.DeviceID == "" {
		writeError(w, http.StatusBadRequest, "week_id, contestant_id, and device_id are required")
		return
	}

	res, err := service.CastVote(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Broadcast live vote tally update via WebSocket to week's connected clients
	realtime.BroadcastToWeek(req.WeekID, "VOTE_UPDATE", map[string]any{
		"week_id":     req.WeekID,
		"total_votes": res.TotalVotes,
		"standings":   res.Standings,
	})

	writeJSON(w, http.StatusOK, res)
}

// RegisterDevice handles POST /api/device/register
func RegisterDevice(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req models.DeviceAccount
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	if req.DeviceID == "" {
		writeError(w, http.StatusBadRequest, "device_id is required")
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
	})
}
