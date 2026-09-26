package api

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/biggboss/pulse/internal/models"
	"github.com/biggboss/pulse/internal/service"
)

// HealthCheck handles /api/health
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status":  "healthy",
		"service": "bigboss-community-api",
		"engine":  "Go 1.22",
	})
}

// GetShows handles GET /api/shows
func GetShows(w http.ResponseWriter, r *http.Request) {
	shows := service.GetShows()
	if shows == nil {
		shows = []models.Show{}
	}
	writeJSON(w, http.StatusOK, shows)
}

// GetShowBySlug handles GET /api/shows/{slug}
func GetShowBySlug(w http.ResponseWriter, r *http.Request) {
	slug := strings.TrimPrefix(r.URL.Path, "/api/shows/")
	slug = strings.Trim(slug, "/")
	show, err := service.GetShowBySlug(slug)
	if err != nil {
		writeError(w, http.StatusNotFound, "show not found")
		return
	}
	writeJSON(w, http.StatusOK, show)
}

// GetSeasonsByShow handles GET /api/shows/{slug}/seasons
func GetSeasonsByShow(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		writeError(w, http.StatusBadRequest, "invalid path")
		return
	}
	showSlug := parts[2]
	seasons := service.GetSeasonsByShow(showSlug)
	writeJSON(w, http.StatusOK, seasons)
}

// GetSeasonDetail handles GET /api/shows/{slug}/seasons/{seasonNum}
func GetSeasonDetail(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 5 {
		writeError(w, http.StatusBadRequest, "invalid path")
		return
	}
	showSlug := parts[2]
	seasonStr := strings.TrimPrefix(strings.TrimPrefix(parts[4], "season-"), "season")
	seasonNum, err := strconv.Atoi(seasonStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid season number")
		return
	}

	season, err := service.GetSeasonByNumber(showSlug, seasonNum)
	if err != nil {
		writeError(w, http.StatusNotFound, "season not found")
		return
	}

	activePoll := service.GetActivePollBySeason(season.ID)
	contestants := service.GetContestantsBySeason(season.ID)
	archive := service.GetArchiveBySeason(season.ID)

	writeJSON(w, http.StatusOK, map[string]any{
		"season":      season,
		"active_poll": activePoll,
		"contestants": contestants,
		"archive":     archive,
	})
}
