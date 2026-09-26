package service

import (
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/biggboss/pulse/internal/models"
)

type Store struct {
	mu           sync.RWMutex
	shows        []models.Show
	seasons      map[string]*models.Season       // key: seasonID
	contestants  map[string]*models.Contestant   // key: contestantID
	weeks        map[string]*models.NominationWeek // key: weekID
	votes        map[string]time.Time            // key: weekID:deviceID:YYYY-MM-DD
	deviceVotes  map[string]string               // key: weekID:deviceID:YYYY-MM-DD -> contestantID
	chatMessages map[string][]models.ChatMessage // key: weekID -> messages
	devices      map[string]*models.DeviceAccount
}

var GlobalStore *Store

func InitStore() {
	s := &Store{
		seasons:      make(map[string]*models.Season),
		contestants:  make(map[string]*models.Contestant),
		weeks:        make(map[string]*models.NominationWeek),
		votes:        make(map[string]time.Time),
		deviceVotes:  make(map[string]string),
		chatMessages: make(map[string][]models.ChatMessage),
		devices:      make(map[string]*models.DeviceAccount),
	}

	// 1. Initial Regional Shows (Permanent canonical language shells)
	s.shows = []models.Show{
		{
			ID:           "bb-telugu",
			Slug:         "telugu",
			Name:         "Bigg Boss Telugu",
			Language:     "Telugu",
			Broadcaster:  "Star Maa & Disney+ Hotstar",
			HostName:     "Nagarjuna",
			AccentColor:  "#3B82F6",
			IsActive:     true,
			DisplayOrder: 1,
		},
		{
			ID:           "bb-tamil",
			Slug:         "tamil",
			Name:         "Bigg Boss Tamil",
			Language:     "Tamil",
			Broadcaster:  "Vijay TV & Disney+ Hotstar",
			HostName:     "Vijay Sethupathi",
			AccentColor:  "#EC4899",
			IsActive:     true,
			DisplayOrder: 2,
		},
		{
			ID:           "bb-hindi",
			Slug:         "hindi",
			Name:         "Bigg Boss Hindi",
			Language:     "Hindi",
			Broadcaster:  "Colors TV & JioCinema",
			HostName:     "Salman Khan",
			AccentColor:  "#F59E0B",
			IsActive:     true,
			DisplayOrder: 3,
		},
		{
			ID:           "bb-kannada",
			Slug:         "kannada",
			Name:         "Bigg Boss Kannada",
			Language:     "Kannada",
			Broadcaster:  "Colors Kannada & JioCinema",
			HostName:     "Kichcha Sudeep",
			AccentColor:  "#10B981",
			IsActive:     true,
			DisplayOrder: 4,
		},
		{
			ID:           "bb-malayalam",
			Slug:         "malayalam",
			Name:         "Bigg Boss Malayalam",
			Language:     "Malayalam",
			Broadcaster:  "Asianet & Disney+ Hotstar",
			HostName:     "Mohanlal",
			AccentColor:  "#8B5CF6",
			IsActive:     true,
			DisplayOrder: 5,
		},
		{
			ID:           "bb-marathi",
			Slug:         "marathi",
			Name:         "Bigg Boss Marathi",
			Language:     "Marathi",
			Broadcaster:  "Colors Marathi & JioCinema",
			HostName:     "Riteish Deshmukh",
			AccentColor:  "#F97316",
			IsActive:     true,
			DisplayOrder: 6,
		},
		{
			ID:           "bb-bangla",
			Slug:         "bangla",
			Name:         "Bigg Boss Bangla",
			Language:     "Bengali",
			Broadcaster:  "Colors Bangla & JioCinema",
			HostName:     "Sourav Ganguly",
			AccentColor:  "#06B6D4",
			IsActive:     true,
			DisplayOrder: 7,
		},
	}

	// 2. Initial Canonical Seasons for each language
	initialSeasons := []*models.Season{
		{
			ID:           "telugu-season-10",
			ShowID:       "bb-telugu",
			ShowSlug:     "telugu",
			SeasonNumber: 10,
			Title:        "Bigg Boss Telugu Season 10",
			Tagline:      "Entertainment Ki Baap",
			Year:         2026,
			Status:       "ongoing",
		},
		{
			ID:           "tamil-season-10",
			ShowID:       "bb-tamil",
			ShowSlug:     "tamil",
			SeasonNumber: 10,
			Title:        "Bigg Boss Tamil Season 10",
			Tagline:      "Aadalam, Velalam",
			Year:         2026,
			Status:       "ongoing",
		},
		{
			ID:           "hindi-season-20",
			ShowID:       "bb-hindi",
			ShowSlug:     "hindi",
			SeasonNumber: 20,
			Title:        "Bigg Boss Hindi Season 20",
			Tagline:      "Ek Vardaan, Poora Raaz",
			Year:         2026,
			Status:       "ongoing",
		},
		{
			ID:           "kannada-season-13",
			ShowID:       "bb-kannada",
			ShowSlug:     "kannada",
			SeasonNumber: 13,
			Title:        "Bigg Boss Kannada Season 13",
			Tagline:      "Gedde Gelthivi",
			Year:         2026,
			Status:       "ongoing",
		},
	}

	for _, ssn := range initialSeasons {
		s.seasons[ssn.ID] = ssn
	}

	GlobalStore = s
}

// NormalizeSlug trims dashes and numbers e.g. "season10" -> "season-10" or checks numeric
func normalizeSeasonNumber(param string) int {
	param = strings.ToLower(param)
	param = strings.TrimPrefix(param, "season-")
	param = strings.TrimPrefix(param, "season")
	var num int
	fmt.Sscanf(param, "%d", &num)
	return num
}

// GetShows returns all available regional shows
func (s *Store) GetShows() []models.Show {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.shows
}

// GetShowBySlug returns a single show
func (s *Store) GetShowBySlug(slug string) (*models.Show, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	slug = strings.ToLower(slug)
	for _, show := range s.shows {
		if show.Slug == slug || strings.TrimPrefix(show.Slug, "bigg-boss-") == slug {
			return &show, nil
		}
	}
	return nil, errors.New("show not found")
}

// GetSeasonsByShow returns all seasons for a given show slug
func (s *Store) GetSeasonsByShow(showSlug string) []models.Season {
	s.mu.RLock()
	defer s.mu.RUnlock()
	showSlug = strings.ToLower(showSlug)
	var result []models.Season
	for _, season := range s.seasons {
		if season.ShowSlug == showSlug {
			result = append(result, *season)
		}
	}
	return result
}

// GetSeasonByNumber returns a specific season e.g. telugu, 10
func (s *Store) GetSeasonByNumber(showSlug string, seasonNum int) (*models.Season, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	showSlug = strings.ToLower(showSlug)
	for _, season := range s.seasons {
		if season.ShowSlug == showSlug && season.SeasonNumber == seasonNum {
			return season, nil
		}
	}
	return nil, errors.New("season not found")
}

// GetContestantsBySeason retrieves all contestants registered in a season
func (s *Store) GetContestantsBySeason(seasonID string) []models.Contestant {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var list []models.Contestant
	for _, c := range s.contestants {
		if c.SeasonID == seasonID {
			list = append(list, *c)
		}
	}
	return list
}

// GetActivePollBySeason returns current active nomination week for a season
func (s *Store) GetActivePollBySeason(seasonID string) *models.NominationWeek {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, w := range s.weeks {
		if w.SeasonID == seasonID && w.IsActive && !w.IsClosed {
			return w
		}
	}
	return nil
}

// GetWeekByID returns a specific week with standings
func (s *Store) GetWeekByID(weekID string) (*models.NominationWeek, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	w, exists := s.weeks[weekID]
	if !exists {
		return nil, errors.New("week not found")
	}
	return w, nil
}

// GetArchiveBySeason returns closed previous weeks for a season
func (s *Store) GetArchiveBySeason(seasonID string) []models.NominationWeek {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var list []models.NominationWeek
	for _, w := range s.weeks {
		if w.SeasonID == seasonID && (w.IsClosed || !w.IsActive) {
			list = append(list, *w)
		}
	}
	return list
}

// CastVote records 1 vote per day per device
func (s *Store) CastVote(req models.VoteRequest) (*models.VoteResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	w, exists := s.weeks[req.WeekID]
	if !exists {
		return nil, errors.New("nomination poll not found")
	}

	if !w.IsActive || w.IsClosed {
		return nil, errors.New("voting for this week is closed")
	}

	today := time.Now().Format("2006-01-02")
	voteKey := fmt.Sprintf("%s:%s:%s", req.WeekID, req.DeviceID, today)

	if _, alreadyVoted := s.votes[voteKey]; alreadyVoted {
		return &models.VoteResponse{
			Success:       false,
			Message:       "You have already voted today! Come back tomorrow to vote again.",
			HasVotedToday: true,
			VotedForID:    s.deviceVotes[voteKey],
			TotalVotes:    w.TotalVotes,
			Standings:     w.Nominees,
		}, nil
	}

	// Find nominee and increment
	found := false
	for i := range w.Nominees {
		if w.Nominees[i].ID == req.ContestantID {
			w.Nominees[i].VoteCount++
			found = true
			break
		}
	}

	if !found {
		return nil, errors.New("selected contestant is not in this week's nominations")
	}

	w.TotalVotes++
	s.votes[voteKey] = time.Now()
	s.deviceVotes[voteKey] = req.ContestantID

	// Recalculate percentages
	for i := range w.Nominees {
		if w.TotalVotes > 0 {
			w.Nominees[i].VoteShare = float64(w.Nominees[i].VoteCount) / float64(w.TotalVotes) * 100.0
		}
	}

	return &models.VoteResponse{
		Success:       true,
		Message:       "Vote cast successfully! Live standings unlocked.",
		HasVotedToday: true,
		VotedForID:    req.ContestantID,
		TotalVotes:    w.TotalVotes,
		Standings:     w.Nominees,
	}, nil
}

// HasVotedToday checks if device has already voted today
func (s *Store) HasVotedToday(weekID, deviceID string) (bool, string) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	today := time.Now().Format("2006-01-02")
	key := fmt.Sprintf("%s:%s:%s", weekID, deviceID, today)
	_, voted := s.votes[key]
	votedFor := s.deviceVotes[key]
	return voted, votedFor
}

// Chat methods
func (s *Store) GetChatMessages(weekID string) []models.ChatMessage {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.chatMessages[weekID]
}

func (s *Store) AddChatMessage(req models.ChatRequest) (*models.ChatMessage, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if req.Content == "" {
		return nil, errors.New("content cannot be empty")
	}

	nickname := req.Nickname
	if nickname == "" {
		nickname = "BB_Fan"
	}
	avatarColor := req.AvatarColor
	if avatarColor == "" {
		avatarColor = "#F59E0B"
	}

	msg := models.ChatMessage{
		ID:          fmt.Sprintf("msg_%d", time.Now().UnixNano()),
		WeekID:      req.WeekID,
		DeviceID:    req.DeviceID,
		Nickname:    nickname,
		AvatarColor: avatarColor,
		Content:     req.Content,
		CreatedAt:   time.Now(),
	}

	s.chatMessages[req.WeekID] = append(s.chatMessages[req.WeekID], msg)
	return &msg, nil
}

// ===================================================================
// ADMIN OPERATIONS (DYNAMIC ADDITION OF SEASONS, CONTESTANTS & POLLS)
// ===================================================================

func (s *Store) AdminCreateSeason(req models.AdminCreateSeasonRequest) (*models.Season, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	showSlug := strings.ToLower(req.ShowSlug)
	seasonID := fmt.Sprintf("%s-season-%d", showSlug, req.SeasonNumber)

	season := &models.Season{
		ID:           seasonID,
		ShowSlug:     showSlug,
		SeasonNumber: req.SeasonNumber,
		Title:        req.Title,
		Tagline:      req.Tagline,
		Year:         req.Year,
		Status:       req.Status,
	}

	s.seasons[seasonID] = season
	return season, nil
}

func (s *Store) AdminCreateContestant(req models.AdminCreateContestantRequest) (*models.Contestant, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if req.Name == "" || req.SeasonID == "" {
		return nil, errors.New("name and season_id are required")
	}

	cID := fmt.Sprintf("c_%d", time.Now().UnixNano())
	slug := strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))

	contestant := &models.Contestant{
		ID:              cID,
		SeasonID:        req.SeasonID,
		Name:            req.Name,
		NativeName:      req.NativeName,
		Slug:            slug,
		PhotoURL:        req.PhotoURL,
		Bio:             req.Bio,
		Occupation:      req.Occupation,
		City:            req.City,
		InstagramHandle: req.InstagramHandle,
		Status:          req.Status,
	}

	if contestant.Status == "" {
		contestant.Status = "in_house"
	}
	if contestant.PhotoURL == "" {
		contestant.PhotoURL = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
	}

	s.contestants[cID] = contestant
	return contestant, nil
}

func (s *Store) AdminDeleteContestant(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.contestants, id)
	return nil
}

func (s *Store) AdminCreatePoll(req models.AdminCreatePollRequest) (*models.NominationWeek, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	season, exists := s.seasons[req.SeasonID]
	if !exists {
		return nil, errors.New("season does not exist")
	}

	// Deactivate any existing active poll for this season
	for _, w := range s.weeks {
		if w.SeasonID == req.SeasonID && w.IsActive {
			w.IsActive = false
			w.IsClosed = true
		}
	}

	weekID := fmt.Sprintf("%s-week-%d", req.SeasonID, req.WeekNumber)

	// Fetch nominated contestants
	var nominees []models.Contestant
	for _, nid := range req.NomineeIDs {
		if c, ok := s.contestants[nid]; ok {
			nomineeCopy := *c
			nomineeCopy.VoteCount = 0
			nomineeCopy.VoteShare = 0
			nominees = append(nominees, nomineeCopy)
		}
	}

	week := &models.NominationWeek{
		ID:           weekID,
		SeasonID:     req.SeasonID,
		ShowSlug:     season.ShowSlug,
		SeasonNumber: season.SeasonNumber,
		WeekNumber:   req.WeekNumber,
		Title:        req.Title,
		Description:  req.Description,
		StartsAt:     req.StartsAt,
		EndsAt:       req.EndsAt,
		IsActive:     true,
		IsClosed:     false,
		TotalVotes:   0,
		Nominees:     nominees,
	}

	s.weeks[weekID] = week
	return week, nil
}

func (s *Store) AdminEvictContestant(weekID string, req models.AdminEvictContestantRequest) (*models.NominationWeek, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	w, exists := s.weeks[weekID]
	if !exists {
		return nil, errors.New("week not found")
	}

	w.IsActive = false
	w.IsClosed = true
	w.OfficialEvictionAnnounced = true
	w.OfficialEvictedContestantID = &req.ContestantID

	for i := range w.Nominees {
		if w.Nominees[i].ID == req.ContestantID {
			w.Nominees[i].IsEvicted = true
			w.Nominees[i].EvictionReason = req.EvictionReason
			w.Nominees[i].Status = "evicted"
		}
	}

	// Update contestant global status too
	if c, ok := s.contestants[req.ContestantID]; ok {
		c.Status = "evicted"
		c.IsEvicted = true
	}

	return w, nil
}

func (s *Store) AdminDeletePoll(weekID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.weeks, weekID)
	return nil
}

func (s *Store) GetAllWeeks() []*models.NominationWeek {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var list []*models.NominationWeek
	for _, w := range s.weeks {
		list = append(list, w)
	}
	return list
}
