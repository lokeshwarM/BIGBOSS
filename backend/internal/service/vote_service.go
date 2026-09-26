package service

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/biggboss/pulse/internal/database"
	"github.com/biggboss/pulse/internal/models"
)

// MemStore is used as FALLBACK when DB is not available
type MemStore struct {
	mu           sync.RWMutex
	shows        []models.Show
	seasons      map[string]*models.Season
	contestants  map[string]*models.Contestant
	weeks        map[string]*models.NominationWeek
	votes        map[string]time.Time
	deviceVotes  map[string]string
	chatMessages map[string][]models.ChatMessage
}

var mem *MemStore

func init() {
	InitStore()
}

func InitStore() {
	mem = &MemStore{
		seasons:      make(map[string]*models.Season),
		contestants:  make(map[string]*models.Contestant),
		weeks:        make(map[string]*models.NominationWeek),
		votes:        make(map[string]time.Time),
		deviceVotes:  make(map[string]string),
		chatMessages: make(map[string][]models.ChatMessage),
	}

	// Seed baseline shows into memory for fallback
	mem.shows = defaultShows()

	if database.IsConnected() {
		log.Println("📦 Service layer: PostgreSQL is live — all reads/writes go to DB")
	} else {
		log.Println("⚠️  Service layer: Running in-memory fallback (data will not persist across restarts)")
		seedMemoryFallback(mem)
	}
}

// ============================================================
// SHOWS
// ============================================================

func GetShows() []models.Show {
	if database.IsConnected() {
		shows, err := database.GetShows()
		if err != nil {
			log.Printf("GetShows DB error: %v", err)
			return mem.shows
		}
		return shows
	}
	mem.mu.RLock()
	defer mem.mu.RUnlock()
	return mem.shows
}

func GetShowBySlug(slug string) (*models.Show, error) {
	slug = strings.ToLower(strings.TrimSpace(slug))
	if database.IsConnected() {
		show, err := database.GetShowBySlug(slug)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return nil, fmt.Errorf("show not found: %s", slug)
			}
			return nil, err
		}
		return show, nil
	}
	// memory fallback
	mem.mu.RLock()
	defer mem.mu.RUnlock()
	for _, s := range mem.shows {
		if s.Slug == slug {
			return &s, nil
		}
	}
	return nil, fmt.Errorf("show not found: %s", slug)
}

func AdminCreateShow(req models.AdminCreateShowRequest) (*models.Show, error) {
	show := models.Show{
		Slug:        strings.ToLower(req.Slug),
		Name:        req.Name,
		Language:    req.Language,
		Broadcaster: req.Broadcaster,
		HostName:    req.HostName,
		AccentColor: req.AccentColor,
		IsActive:    true,
	}
	if show.AccentColor == "" {
		show.AccentColor = "#F59E0B"
	}
	if database.IsConnected() {
		return database.CreateShow(show)
	}
	show.ID = fmt.Sprintf("show-%d", time.Now().UnixNano())
	show.CreatedAt = time.Now()
	mem.mu.Lock()
	mem.shows = append(mem.shows, show)
	mem.mu.Unlock()
	return &show, nil
}

// ============================================================
// SEASONS
// ============================================================

func GetSeasonsByShow(showSlug string) []models.Season {
	showSlug = strings.ToLower(showSlug)
	if database.IsConnected() {
		show, err := database.GetShowBySlug(showSlug)
		if err != nil {
			return nil
		}
		seasons, err := database.GetSeasonsByShow(show.ID)
		if err != nil {
			log.Printf("GetSeasonsByShow DB error: %v", err)
		}
		// Attach slug
		for i := range seasons {
			seasons[i].ShowSlug = showSlug
		}
		return seasons
	}
	// memory fallback
	mem.mu.RLock()
	defer mem.mu.RUnlock()
	var result []models.Season
	for _, s := range mem.seasons {
		if s.ShowSlug == showSlug {
			result = append(result, *s)
		}
	}
	return result
}

func GetSeasonByNumber(showSlug string, seasonNum int) (*models.Season, error) {
	showSlug = strings.ToLower(showSlug)
	if database.IsConnected() {
		season, err := database.GetSeasonBySlugAndNumber(showSlug, seasonNum)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return nil, fmt.Errorf("season not found: %s season %d", showSlug, seasonNum)
			}
			return nil, err
		}
		return season, nil
	}
	// memory fallback
	mem.mu.RLock()
	defer mem.mu.RUnlock()
	for _, s := range mem.seasons {
		if s.ShowSlug == showSlug && s.SeasonNumber == seasonNum {
			return s, nil
		}
	}
	return nil, fmt.Errorf("season not found")
}

func AdminCreateSeason(req models.AdminCreateSeasonRequest) (*models.Season, error) {
	if database.IsConnected() {
		show, err := database.GetShowBySlug(strings.ToLower(req.ShowSlug))
		if err != nil {
			return nil, fmt.Errorf("show '%s' not found", req.ShowSlug)
		}
		return database.CreateSeason(show.ID, req)
	}
	// memory fallback
	seasonID := fmt.Sprintf("%s-season-%d", strings.ToLower(req.ShowSlug), req.SeasonNumber)
	season := &models.Season{
		ID:           seasonID,
		ShowSlug:     strings.ToLower(req.ShowSlug),
		SeasonNumber: req.SeasonNumber,
		Title:        req.Title,
		Tagline:      req.Tagline,
		Year:         req.Year,
		Status:       req.Status,
	}
	mem.mu.Lock()
	mem.seasons[seasonID] = season
	mem.mu.Unlock()
	return season, nil
}

// ============================================================
// CONTESTANTS
// ============================================================

func GetContestantsBySeason(seasonID string) []models.Contestant {
	if database.IsConnected() {
		list, err := database.GetContestantsBySeason(seasonID)
		if err != nil {
			log.Printf("GetContestantsBySeason DB error: %v", err)
		}
		return list
	}
	mem.mu.RLock()
	defer mem.mu.RUnlock()
	var list []models.Contestant
	for _, c := range mem.contestants {
		if c.SeasonID == seasonID {
			list = append(list, *c)
		}
	}
	return list
}

func AdminCreateContestant(req models.AdminCreateContestantRequest) (*models.Contestant, error) {
	if database.IsConnected() {
		return database.CreateContestant(req)
	}
	// memory fallback
	cID := fmt.Sprintf("c_%d", time.Now().UnixNano())
	slug := strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))
	if req.Status == "" {
		req.Status = "in_house"
	}
	if req.PhotoURL == "" {
		req.PhotoURL = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
	}
	c := &models.Contestant{
		ID: cID, SeasonID: req.SeasonID, Name: req.Name, NativeName: req.NativeName,
		Slug: slug, PhotoURL: req.PhotoURL, Bio: req.Bio, Occupation: req.Occupation,
		City: req.City, InstagramHandle: req.InstagramHandle, Status: req.Status,
	}
	mem.mu.Lock()
	mem.contestants[cID] = c
	mem.mu.Unlock()
	return c, nil
}

func AdminDeleteContestant(id string) error {
	if database.IsConnected() {
		return database.DeleteContestant(id)
	}
	mem.mu.Lock()
	delete(mem.contestants, id)
	mem.mu.Unlock()
	return nil
}

func AdminUpdateContestant(c models.Contestant) error {
	if database.IsConnected() {
		return database.UpdateContestant(c)
	}
	mem.mu.Lock()
	if existing, ok := mem.contestants[c.ID]; ok {
		*existing = c
	}
	mem.mu.Unlock()
	return nil
}

// ============================================================
// POLLS / WEEKS
// ============================================================

func GetActivePollBySeason(seasonID string) *models.NominationWeek {
	if database.IsConnected() {
		w, err := database.GetActivePollBySeason(seasonID)
		if err != nil {
			return nil
		}
		return w
	}
	mem.mu.RLock()
	defer mem.mu.RUnlock()
	for _, w := range mem.weeks {
		if w.SeasonID == seasonID && w.IsActive && !w.IsClosed {
			return w
		}
	}
	return nil
}

func GetWeekByID(weekID string) (*models.NominationWeek, error) {
	if database.IsConnected() {
		return database.GetWeekByID(weekID)
	}
	mem.mu.RLock()
	defer mem.mu.RUnlock()
	w, ok := mem.weeks[weekID]
	if !ok {
		return nil, errors.New("week not found")
	}
	return w, nil
}

func GetArchiveBySeason(seasonID string) []models.NominationWeek {
	if database.IsConnected() {
		all, err := database.GetAllWeeksBySeason(seasonID)
		if err != nil {
			return nil
		}
		var closed []models.NominationWeek
		for _, w := range all {
			if w.IsClosed || !w.IsActive {
				closed = append(closed, w)
			}
		}
		return closed
	}
	mem.mu.RLock()
	defer mem.mu.RUnlock()
	var list []models.NominationWeek
	for _, w := range mem.weeks {
		if w.SeasonID == seasonID && (w.IsClosed || !w.IsActive) {
			list = append(list, *w)
		}
	}
	return list
}

func AdminCreatePoll(req models.AdminCreatePollRequest) (*models.NominationWeek, error) {
	if database.IsConnected() {
		return database.CreateWeek(req)
	}
	// memory fallback
	mem.mu.Lock()
	defer mem.mu.Unlock()
	season, ok := mem.seasons[req.SeasonID]
	if !ok {
		return nil, errors.New("season not found")
	}
	for _, w := range mem.weeks {
		if w.SeasonID == req.SeasonID && w.IsActive {
			w.IsActive = false
			w.IsClosed = true
		}
	}
	weekID := fmt.Sprintf("%s-week-%d", req.SeasonID, req.WeekNumber)
	var nominees []models.Contestant
	for _, nid := range req.NomineeIDs {
		if c, ok := mem.contestants[nid]; ok {
			nc := *c
			nc.VoteCount = 0
			nc.VoteShare = 0
			nominees = append(nominees, nc)
		}
	}
	week := &models.NominationWeek{
		ID: weekID, SeasonID: req.SeasonID, ShowSlug: season.ShowSlug,
		SeasonNumber: season.SeasonNumber, WeekNumber: req.WeekNumber,
		Title: req.Title, Description: req.Description, StartsAt: req.StartsAt,
		EndsAt: req.EndsAt, IsActive: true, IsClosed: false, Nominees: nominees,
	}
	mem.weeks[weekID] = week
	return week, nil
}

func AdminEvictContestant(weekID string, req models.AdminEvictContestantRequest) (*models.NominationWeek, error) {
	if database.IsConnected() {
		return database.EvictContestant(weekID, req.ContestantID, req.EvictionReason)
	}
	mem.mu.Lock()
	defer mem.mu.Unlock()
	w, ok := mem.weeks[weekID]
	if !ok {
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
	if c, ok := mem.contestants[req.ContestantID]; ok {
		c.Status = "evicted"
		c.IsEvicted = true
	}
	return w, nil
}

func AdminClosePoll(weekID string) error {
	if database.IsConnected() {
		return database.CloseWeek(weekID)
	}
	mem.mu.Lock()
	defer mem.mu.Unlock()
	if w, ok := mem.weeks[weekID]; ok {
		w.IsActive = false
		w.IsClosed = true
		return nil
	}
	return errors.New("poll not found")
}

func AdminDeletePoll(weekID string) error {
	if database.IsConnected() {
		return database.Exec(`DELETE FROM nomination_weeks WHERE id=$1`, weekID)
	}
	mem.mu.Lock()
	delete(mem.weeks, weekID)
	mem.mu.Unlock()
	return nil
}

func GetAllWeeks() []models.NominationWeek {
	if database.IsConnected() {
		weeks, err := database.GetAllWeeks()
		if err != nil {
			log.Printf("GetAllWeeks DB error: %v", err)
		}
		return weeks
	}
	mem.mu.RLock()
	defer mem.mu.RUnlock()
	var list []models.NominationWeek
	for _, w := range mem.weeks {
		list = append(list, *w)
	}
	return list
}

// ============================================================
// VOTING
// ============================================================

// CastVote records a vote. Returns VoteResponse. Uses DB if connected.
func CastVote(req models.VoteRequest) (*models.VoteResponse, error) {
	if database.IsConnected() {
		return castVoteDB(req)
	}
	return castVoteMem(req)
}

func castVoteDB(req models.VoteRequest) (*models.VoteResponse, error) {
	// Verify week exists and is active
	week, err := database.GetWeekByID(req.WeekID)
	if err != nil {
		return nil, errors.New("nomination poll not found")
	}
	if !week.IsActive || week.IsClosed {
		return nil, errors.New("voting for this week is closed")
	}

	// Verify contestant is a nominee in this week
	isNominee := false
	for _, n := range week.Nominees {
		if n.ID == req.ContestantID {
			isNominee = true
			break
		}
	}
	if !isNominee {
		return nil, errors.New("selected contestant is not nominated this week")
	}

	// Check if already voted today (pre-check for good UX — DB constraint is authoritative)
	voted, votedForID, _ := database.HasVotedToday(req.WeekID, req.DeviceID)
	if voted {
		// Reload nominees for current standings
		nominees, _ := database.GetNomineesByWeek(req.WeekID)
		total, _ := database.GetWeekTotalVotes(req.WeekID)
		return &models.VoteResponse{
			Success:       false,
			Message:       "You've already voted today! Come back tomorrow.",
			HasVotedToday: true,
			VotedForID:    votedForID,
			TotalVotes:    total,
			Standings:     nominees,
		}, nil
	}

	// Cast the vote
	success, err := database.CastVote(req.WeekID, req.ContestantID, req.DeviceID)
	if err != nil {
		return nil, fmt.Errorf("vote insert error: %w", err)
	}
	if !success {
		// Duplicate constraint hit (race condition)
		nominees, _ := database.GetNomineesByWeek(req.WeekID)
		total, _ := database.GetWeekTotalVotes(req.WeekID)
		return &models.VoteResponse{
			Success: false, Message: "You've already voted today!",
			HasVotedToday: true, VotedForID: req.ContestantID,
			TotalVotes: total, Standings: nominees,
		}, nil
	}

	nominees, _ := database.GetNomineesByWeek(req.WeekID)
	total, _ := database.GetWeekTotalVotes(req.WeekID)
	return &models.VoteResponse{
		Success:       true,
		Message:       "Vote cast! Live standings unlocked. 🎉",
		HasVotedToday: true,
		VotedForID:    req.ContestantID,
		TotalVotes:    total,
		Standings:     nominees,
	}, nil
}

func castVoteMem(req models.VoteRequest) (*models.VoteResponse, error) {
	mem.mu.Lock()
	defer mem.mu.Unlock()

	w, ok := mem.weeks[req.WeekID]
	if !ok {
		return nil, errors.New("nomination poll not found")
	}
	if !w.IsActive || w.IsClosed {
		return nil, errors.New("voting for this week is closed")
	}

	today := time.Now().Format("2006-01-02")
	voteKey := fmt.Sprintf("%s:%s:%s", req.WeekID, req.DeviceID, today)

	if _, voted := mem.votes[voteKey]; voted {
		return &models.VoteResponse{
			Success: false, Message: "You've already voted today!",
			HasVotedToday: true, VotedForID: mem.deviceVotes[voteKey],
			TotalVotes: w.TotalVotes, Standings: w.Nominees,
		}, nil
	}

	found := false
	for i := range w.Nominees {
		if w.Nominees[i].ID == req.ContestantID {
			w.Nominees[i].VoteCount++
			found = true
			break
		}
	}
	if !found {
		return nil, errors.New("contestant not in this poll")
	}
	w.TotalVotes++
	mem.votes[voteKey] = time.Now()
	mem.deviceVotes[voteKey] = req.ContestantID
	for i := range w.Nominees {
		if w.TotalVotes > 0 {
			w.Nominees[i].VoteShare = float64(w.Nominees[i].VoteCount) / float64(w.TotalVotes) * 100.0
		}
	}
	return &models.VoteResponse{
		Success: true, Message: "Vote cast! 🎉",
		HasVotedToday: true, VotedForID: req.ContestantID,
		TotalVotes: w.TotalVotes, Standings: w.Nominees,
	}, nil
}

func HasVotedToday(weekID, deviceID string) (bool, string) {
	if database.IsConnected() {
		voted, votedFor, _ := database.HasVotedToday(weekID, deviceID)
		return voted, votedFor
	}
	mem.mu.RLock()
	defer mem.mu.RUnlock()
	today := time.Now().Format("2006-01-02")
	key := fmt.Sprintf("%s:%s:%s", weekID, deviceID, today)
	_, voted := mem.votes[key]
	return voted, mem.deviceVotes[key]
}

// ============================================================
// CHAT
// ============================================================

func GetChatMessages(weekID string) []models.ChatMessage {
	if database.IsConnected() {
		msgs, err := database.GetChatMessages(weekID, 100)
		if err != nil {
			log.Printf("GetChatMessages DB error: %v", err)
		}
		return msgs
	}
	mem.mu.RLock()
	defer mem.mu.RUnlock()
	return mem.chatMessages[weekID]
}

func AddChatMessage(req models.ChatRequest) (*models.ChatMessage, error) {
	if req.Content == "" {
		return nil, errors.New("content cannot be empty")
	}
	if len([]rune(req.Content)) > 500 {
		return nil, errors.New("message too long (max 500 characters)")
	}
	if req.Nickname == "" {
		req.Nickname = "BB_Fan"
	}
	if req.AvatarColor == "" {
		req.AvatarColor = "#F59E0B"
	}

	if database.IsConnected() {
		return database.SaveChatMessage(req)
	}
	msg := models.ChatMessage{
		ID:          fmt.Sprintf("msg_%d", time.Now().UnixNano()),
		WeekID:      req.WeekID,
		DeviceID:    req.DeviceID,
		Nickname:    req.Nickname,
		AvatarColor: req.AvatarColor,
		Content:     req.Content,
		CreatedAt:   time.Now(),
	}
	mem.mu.Lock()
	mem.chatMessages[req.WeekID] = append(mem.chatMessages[req.WeekID], msg)
	mem.mu.Unlock()
	return &msg, nil
}

// ============================================================
// ADMIN DATA OVERVIEW
// ============================================================

func GetAdminData() map[string]any {
	shows := GetShows()
	var allSeasons []models.Season
	var allContestants []models.Contestant

	for _, show := range shows {
		seasons := GetSeasonsByShow(show.Slug)
		allSeasons = append(allSeasons, seasons...)
		for _, s := range seasons {
			cList := GetContestantsBySeason(s.ID)
			allContestants = append(allContestants, cList...)
		}
	}
	allWeeks := GetAllWeeks()

	return map[string]any{
		"shows":       shows,
		"seasons":     allSeasons,
		"contestants": allContestants,
		"polls":       allWeeks,
	}
}

// ============================================================
// DEFAULTS FOR MEMORY FALLBACK
// ============================================================

func defaultShows() []models.Show {
	return []models.Show{
		{ID: "bb-telugu", Slug: "telugu", Name: "Bigg Boss Telugu", Language: "Telugu", Broadcaster: "Star Maa & Disney+ Hotstar", HostName: "Nagarjuna", AccentColor: "#3B82F6", IsActive: true, DisplayOrder: 1},
		{ID: "bb-tamil", Slug: "tamil", Name: "Bigg Boss Tamil", Language: "Tamil", Broadcaster: "Vijay TV & Disney+ Hotstar", HostName: "Vijay Sethupathi", AccentColor: "#EC4899", IsActive: true, DisplayOrder: 2},
		{ID: "bb-hindi", Slug: "hindi", Name: "Bigg Boss Hindi", Language: "Hindi", Broadcaster: "Colors TV & JioCinema", HostName: "Salman Khan", AccentColor: "#F59E0B", IsActive: true, DisplayOrder: 3},
		{ID: "bb-kannada", Slug: "kannada", Name: "Bigg Boss Kannada", Language: "Kannada", Broadcaster: "Colors Kannada & JioCinema", HostName: "Kichcha Sudeep", AccentColor: "#10B981", IsActive: true, DisplayOrder: 4},
		{ID: "bb-malayalam", Slug: "malayalam", Name: "Bigg Boss Malayalam", Language: "Malayalam", Broadcaster: "Asianet & Disney+ Hotstar", HostName: "Mohanlal", AccentColor: "#8B5CF6", IsActive: true, DisplayOrder: 5},
		{ID: "bb-marathi", Slug: "marathi", Name: "Bigg Boss Marathi", Language: "Marathi", Broadcaster: "Colors Marathi & JioCinema", HostName: "Riteish Deshmukh", AccentColor: "#F97316", IsActive: true, DisplayOrder: 6},
		{ID: "bb-bangla", Slug: "bangla", Name: "Bigg Boss Bangla", Language: "Bengali", Broadcaster: "Colors Bangla & JioCinema", HostName: "Sourav Ganguly", AccentColor: "#06B6D4", IsActive: true, DisplayOrder: 7},
	}
}

func seedMemoryFallback(s *MemStore) {
	initialSeasons := []*models.Season{
		{ID: "telugu-season-10", ShowID: "bb-telugu", ShowSlug: "telugu", SeasonNumber: 10, Title: "Bigg Boss Telugu Season 10", Tagline: "Entertainment Ki Baap", Year: 2026, Status: "ongoing"},
		{ID: "tamil-season-10", ShowID: "bb-tamil", ShowSlug: "tamil", SeasonNumber: 10, Title: "Bigg Boss Tamil Season 10", Tagline: "Aadalam, Velalam", Year: 2026, Status: "ongoing"},
		{ID: "hindi-season-20", ShowID: "bb-hindi", ShowSlug: "hindi", SeasonNumber: 20, Title: "Bigg Boss Hindi Season 20", Tagline: "Ek Vardaan, Poora Raaz", Year: 2026, Status: "ongoing"},
		{ID: "kannada-season-13", ShowID: "bb-kannada", ShowSlug: "kannada", SeasonNumber: 13, Title: "Bigg Boss Kannada Season 13", Tagline: "Gedde Gelthivi", Year: 2026, Status: "ongoing"},
	}
	for _, ssn := range initialSeasons {
		s.seasons[ssn.ID] = ssn
	}
}
