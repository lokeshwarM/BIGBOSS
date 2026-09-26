package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/biggboss/pulse/internal/service"
)

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
	slug := strings.TrimPrefix(r.URL.Path, "/api/shows/")
	slug = strings.Trim(slug, "/")
	show, err := service.GlobalStore.GetShowBySlug(slug)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	writeJSON(w, http.StatusOK, show)
}

// GetSeasonsByShow handles GET /api/shows/{slug}/seasons
func GetSeasonsByShow(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}
	showSlug := parts[2]
	seasons := service.GlobalStore.GetSeasonsByShow(showSlug)
	writeJSON(w, http.StatusOK, seasons)
}

// GetSeasonDetail handles GET /api/shows/{slug}/seasons/{seasonNum}
func GetSeasonDetail(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 5 {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}
	showSlug := parts[2]
	seasonStr := strings.TrimPrefix(strings.TrimPrefix(parts[4], "season-"), "season")
	seasonNum, err := strconv.Atoi(seasonStr)
	if err != nil {
		http.Error(w, "invalid season number", http.StatusBadRequest)
		return
	}

	season, err := service.GlobalStore.GetSeasonByNumber(showSlug, seasonNum)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	// Attach active poll and contestants
	activePoll := service.GlobalStore.GetActivePollBySeason(season.ID)
	contestants := service.GlobalStore.GetContestantsBySeason(season.ID)
	archive := service.GlobalStore.GetArchiveBySeason(season.ID)

	response := map[string]any{
		"season":       season,
		"active_poll":  activePoll,
		"contestants":  contestants,
		"archive":      archive,
	}

	writeJSON(w, http.StatusOK, response)
}

// GetSeasonContestants handles GET /api/seasons/{seasonId}/contestants
func GetSeasonContestants(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}
	seasonID := parts[2]
	list := service.GlobalStore.GetContestantsBySeason(seasonID)
	writeJSON(w, http.StatusOK, list)
}
