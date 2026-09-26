package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/biggboss/pulse/internal/models"
	"github.com/biggboss/pulse/internal/service"
)



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

// AdminSeasonByIDHandler handles PUT/PATCH and DELETE /api/admin/seasons/{id}
func AdminSeasonByIDHandler(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	sID := strings.TrimPrefix(r.URL.Path, "/api/admin/seasons/")
	sID = strings.Trim(sID, "/")
	if sID == "" {
		writeError(w, http.StatusBadRequest, "season id required")
		return
	}

	switch r.Method {
	case http.MethodDelete:
		if err := service.AdminDeleteSeason(sID); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"success": true, "deleted": sID})

	case http.MethodPatch, http.MethodPut:
		var req models.AdminUpdateSeasonRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json payload")
			return
		}
		updated, err := service.AdminUpdateSeason(sID, req)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, updated)

	default:
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
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

	// /api/admin/polls/{id}/close
	if len(parts) >= 5 && parts[4] == "close" {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}
		weekID := parts[3]
		if err := service.AdminClosePoll(weekID); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"success": true, "closed": weekID})
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

// ─────────────────────────────────────────────────────────
// COMMUNITY MODERATION HANDLERS
// ─────────────────────────────────────────────────────────

// AdminPostActionHandler handles POST /api/admin/posts/{id}/pin and DELETE /api/admin/posts/{id}
func AdminPostActionHandler(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 {
		writeError(w, http.StatusBadRequest, "invalid post path")
		return
	}
	postID := parts[3]

	// /api/admin/posts/{id}/pin
	if len(parts) >= 5 && parts[4] == "pin" {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}
		var req struct {
			IsPinned bool `json:"is_pinned"`
		}
		_ = json.NewDecoder(r.Body).Decode(&req)
		if err := service.PinCommunityPost(postID, req.IsPinned); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"success": true, "post_id": postID, "is_pinned": req.IsPinned})
		return
	}

	// DELETE /api/admin/posts/{id}
	if r.Method == http.MethodDelete {
		if err := service.HideCommunityPost(postID); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"success": true, "deleted_post_id": postID})
		return
	}

	writeError(w, http.StatusMethodNotAllowed, "method not allowed")
}

// AdminCommentActionHandler handles DELETE /api/admin/comments/{id}
func AdminCommentActionHandler(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	if r.Method != http.MethodDelete {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 {
		writeError(w, http.StatusBadRequest, "invalid comment path")
		return
	}
	commentID := parts[3]

	if err := service.DeleteCommunityComment(commentID); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "deleted_comment_id": commentID})
}

// AdminReportsHandler handles GET /api/admin/reports and POST /api/admin/reports/{id}/resolve
func AdminReportsHandler(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

	// POST /api/admin/reports/{id}/resolve
	if len(parts) >= 5 && parts[4] == "resolve" {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}
		reportID := parts[3]
		var req struct {
			Status string `json:"status"` // 'resolved', 'dismissed'
		}
		_ = json.NewDecoder(r.Body).Decode(&req)
		if err := service.ResolveModerationReport(reportID, req.Status); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"success": true, "report_id": reportID})
		return
	}

	// GET /api/admin/reports
	if r.Method == http.MethodGet {
		status := r.URL.Query().Get("status")
		reports, err := service.GetModerationReports(status)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, reports)
		return
	}

	writeError(w, http.StatusMethodNotAllowed, "method not allowed")
}

// AdminGetAllDataHandler returns aggregated platform data for admin dashboard
func AdminGetAllDataHandler(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	data := service.GetAdminData()
	writeJSON(w, http.StatusOK, data)
}
