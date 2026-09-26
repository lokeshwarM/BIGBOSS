package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/biggboss/pulse/internal/models"
	"github.com/biggboss/pulse/internal/service"
)

// ─────────────────────────────────────────────────────────
// ADMIN AUTH MIDDLEWARE
// ─────────────────────────────────────────────────────────
// requireAdmin checks for the X-Admin-Key header.
// Call this at the top of each admin handler.
func requireAdmin(w http.ResponseWriter, r *http.Request) bool {
	return checkAdminKey(w, r)
}

// ─────────────────────────────────────────────────────────
// SEASON MANAGEMENT
// ─────────────────────────────────────────────────────────

// AdminCreateSeasonHandler handles POST /api/admin/seasons
func AdminCreateSeasonHandler(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req models.AdminCreateSeasonRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}
	if req.ShowSlug == "" || req.SeasonNumber == 0 || req.Title == "" {
		writeError(w, http.StatusBadRequest, "show_slug, season_number, and title are required")
		return
	}

	season, err := service.AdminCreateSeason(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, season)
}

// ─────────────────────────────────────────────────────────
// SHOW MANAGEMENT
// ─────────────────────────────────────────────────────────

// AdminCreateShowHandler handles POST /api/admin/shows
func AdminCreateShowHandler(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req models.AdminCreateShowRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}
	if req.Slug == "" || req.Name == "" || req.Language == "" {
		writeError(w, http.StatusBadRequest, "slug, name, and language are required")
		return
	}

	show, err := service.AdminCreateShow(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, show)
}

// ─────────────────────────────────────────────────────────
// CONTESTANT MANAGEMENT
// ─────────────────────────────────────────────────────────

// AdminContestantsHandler handles POST /api/admin/contestants (create)
func AdminContestantsHandler(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req models.AdminCreateContestantRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}
	if req.Name == "" || req.SeasonID == "" {
		writeError(w, http.StatusBadRequest, "name and season_id are required")
		return
	}

	contestant, err := service.AdminCreateContestant(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, contestant)
}

// AdminContestantByIDHandler handles DELETE/PATCH /api/admin/contestants/{id}
func AdminContestantByIDHandler(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	cID := strings.TrimPrefix(r.URL.Path, "/api/admin/contestants/")
	cID = strings.Trim(cID, "/")
	if cID == "" {
		writeError(w, http.StatusBadRequest, "contestant id required")
		return
	}

	switch r.Method {
	case http.MethodDelete:
		if err := service.AdminDeleteContestant(cID); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"success": true})

	case http.MethodPatch, http.MethodPut:
		var c models.Contestant
		if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json payload")
			return
		}
		c.ID = cID
		if err := service.AdminUpdateContestant(c); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, c)

	default:
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

// ─────────────────────────────────────────────────────────
// POLL MANAGEMENT
// ─────────────────────────────────────────────────────────

// AdminPollsHandler handles POST /api/admin/polls
func AdminPollsHandler(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req models.AdminCreatePollRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}
	if req.SeasonID == "" || req.WeekNumber == 0 || req.Title == "" {
		writeError(w, http.StatusBadRequest, "season_id, week_number, and title are required")
		return
	}

	poll, err := service.AdminCreatePoll(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, poll)
}

// AdminPollByIDHandler handles DELETE /api/admin/polls/{id} and sub-paths
func AdminPollByIDHandler(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}

	path := strings.Trim(r.URL.Path, "/")
	parts := strings.Split(path, "/")

	// /api/admin/polls/{id}/evict
	if len(parts) >= 5 && parts[4] == "evict" {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}
		weekID := parts[3]
		var req models.AdminEvictContestantRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json payload")
			return
		}
		if req.ContestantID == "" {
			writeError(w, http.StatusBadRequest, "contestant_id is required")
			return
		}
		if req.EvictionReason == "" {
			req.EvictionReason = "public_vote"
		}
		poll, err := service.AdminEvictContestant(weekID, req)
		if err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, poll)
		return
	}

	// /api/admin/polls/{id}  DELETE
	if r.Method == http.MethodDelete && len(parts) >= 4 {
		weekID := parts[3]
		if err := service.AdminDeletePoll(weekID); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"success": true})
		return
	}

	writeError(w, http.StatusNotFound, "endpoint not found")
}

// AdminGetAllDataHandler returns aggregated platform data for admin dashboard
func AdminGetAllDataHandler(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	data := service.GetAdminData()
	writeJSON(w, http.StatusOK, data)
}
