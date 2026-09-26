package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/biggboss/pulse/internal/models"
	"github.com/biggboss/pulse/internal/service"
)

// AdminCreateSeasonHandler handles POST /api/admin/seasons
func AdminCreateSeasonHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.AdminCreateSeasonRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json payload", http.StatusBadRequest)
		return
	}

	season, err := service.GlobalStore.AdminCreateSeason(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, season)
}

// AdminCreateContestantHandler handles POST /api/admin/contestants
func AdminCreateContestantHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.AdminCreateContestantRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json payload", http.StatusBadRequest)
		return
	}

	contestant, err := service.GlobalStore.AdminCreateContestant(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, contestant)
}

// AdminDeleteContestantHandler handles DELETE /api/admin/contestants/{id}
func AdminDeleteContestantHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cID := strings.TrimPrefix(r.URL.Path, "/api/admin/contestants/")
	err := service.GlobalStore.AdminDeleteContestant(cID)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

// AdminCreatePollHandler handles POST /api/admin/polls
func AdminCreatePollHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.AdminCreatePollRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json payload", http.StatusBadRequest)
		return
	}

	poll, err := service.GlobalStore.AdminCreatePoll(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, poll)
}

// AdminEvictContestantHandler handles POST /api/admin/polls/{id}/evict
func AdminEvictContestantHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}
	weekID := parts[3]

	var req models.AdminEvictContestantRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json payload", http.StatusBadRequest)
		return
	}

	poll, err := service.GlobalStore.AdminEvictContestant(weekID, req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, poll)
}

// AdminDeletePollHandler handles DELETE /api/admin/polls/{id}
func AdminDeletePollHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	weekID := strings.TrimPrefix(r.URL.Path, "/api/admin/polls/")
	err := service.GlobalStore.AdminDeletePoll(weekID)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

// AdminGetAllDataHandler returns all shows, seasons, contestants and polls for the admin dashboard
func AdminGetAllDataHandler(w http.ResponseWriter, r *http.Request) {
	shows := service.GlobalStore.GetShows()
	var allSeasons []models.Season
	var allContestants []models.Contestant
	for _, show := range shows {
		seasons := service.GlobalStore.GetSeasonsByShow(show.Slug)
		allSeasons = append(allSeasons, seasons...)
		for _, s := range seasons {
			cList := service.GlobalStore.GetContestantsBySeason(s.ID)
			allContestants = append(allContestants, cList...)
		}
	}
	allWeeks := service.GlobalStore.GetAllWeeks()

	writeJSON(w, http.StatusOK, map[string]any{
		"shows":       shows,
		"seasons":     allSeasons,
		"contestants": allContestants,
		"polls":       allWeeks,
	})
}
