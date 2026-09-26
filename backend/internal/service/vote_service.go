package service

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/biggboss/pulse/internal/models"
)

type Store struct {
	mu           sync.RWMutex
	shows        []models.Show
	seasons      map[string]*models.Season // key: showSlug
	weeks        map[string]*models.NominationWeek // key: weekID
	votes        map[string]time.Time // key: weekID:deviceID:YYYY-MM-DD
	deviceVotes  map[string]string // key: weekID:deviceID:YYYY-MM-DD -> contestantID
	chatMessages map[string][]models.ChatMessage // key: weekID -> messages
	devices      map[string]*models.DeviceAccount
}

var GlobalStore *Store

func InitStore() {
	s := &Store{
		seasons:      make(map[string]*models.Season),
		weeks:        make(map[string]*models.NominationWeek),
		votes:        make(map[string]time.Time),
		deviceVotes:  make(map[string]string),
		chatMessages: make(map[string][]models.ChatMessage),
		devices:      make(map[string]*models.DeviceAccount),
	}

	// Seed Shows
	s.shows = []models.Show{
		{
			ID:           "bb-hindi",
			Slug:         "bigg-boss-hindi",
			Name:         "Bigg Boss Hindi",
			Language:     "Hindi",
			Broadcaster:  "Colors TV & JioCinema",
			HostName:     "Salman Khan",
			AccentColor:  "#F59E0B",
			IsActive:     true,
			DisplayOrder: 1,
		},
		{
			ID:           "bb-tamil",
			Slug:         "bigg-boss-tamil",
			Name:         "Bigg Boss Tamil",
			Language:     "Tamil",
			Broadcaster:  "Vijay TV & Disney+ Hotstar",
			HostName:     "Vijay Sethupathi",
			AccentColor:  "#EC4899",
			IsActive:     true,
			DisplayOrder: 2,
		},
		{
			ID:           "bb-telugu",
			Slug:         "bigg-boss-telugu",
			Name:         "Bigg Boss Telugu",
			Language:     "Telugu",
			Broadcaster:  "Star Maa & Disney+ Hotstar",
			HostName:     "Nagarjuna",
			AccentColor:  "#3B82F6",
			IsActive:     true,
			DisplayOrder: 3,
		},
		{
			ID:           "bb-kannada",
			Slug:         "bigg-boss-kannada",
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
			Slug:         "bigg-boss-malayalam",
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
			Slug:         "bigg-boss-marathi",
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
			Slug:         "bigg-boss-bangla",
			Name:         "Bigg Boss Bangla",
			Language:     "Bengali",
			Broadcaster:  "Colors Bangla & JioCinema",
			HostName:     "Sourav Ganguly",
			AccentColor:  "#06B6D4",
			IsActive:     true,
			DisplayOrder: 7,
		},
	}

	// Calculate Monday Night to Friday Night window
	now := time.Now()
	// Week 3 active
	hindiWeek3 := &models.NominationWeek{
		ID:                        "bb-hindi-s20-w3",
		SeasonID:                  "bb-hindi-s20",
		WeekNumber:                3,
		Title:                     "Week 3 Eviction Poll: Save Yung DSA or Isha Rikhi",
		Description:               "Reverse nominations: Housemates chose whom to save, leaving Yung DSA & Isha Rikhi facing eviction.",
		StartsAt:                  now.Add(-48 * time.Hour),
		EndsAt:                    now.Add(48 * time.Hour),
		IsActive:                  true,
		IsClosed:                  false,
		OfficialEvictionAnnounced: false,
		TotalVotes:                14280,
		Nominees: []models.Contestant{
			{
				ID:               "c-yung-dsa",
				SeasonID:         "bb-hindi-s20",
				Name:             "Harsh Vijay Machare (Yung DSA)",
				NativeName:       "हर्ष विजय मचारे (यंग डीएसए)",
				Slug:             "harsh-vijay-machare-yung-dsa",
				PhotoURL:         "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
				Bio:              "Pune Yerawada hip-hop artist known for Yeda Yung.",
				Occupation:       "Rapper, Songwriter",
				Status:           "in_house",
				VoteCount:        8920,
				VoteShare:        62.4,
				NominationsCount: 1,
			},
			{
				ID:               "c-isha-rikhi",
				SeasonID:         "bb-hindi-s20",
				Name:             "Isha Rikhi",
				NativeName:       "ईशा रिखी",
				Slug:             "isha-rikhi",
				PhotoURL:         "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
				Bio:              "Punjabi film actress and renowned fashion model.",
				Occupation:       "Actress, Model",
				Status:           "in_house",
				VoteCount:        5360,
				VoteShare:        37.6,
				NominationsCount: 1,
			},
		},
		Show: &s.shows[0],
	}

	// Tamil Season 10 Week 3 Active
	tamilWeek3 := &models.NominationWeek{
		ID:                        "bb-tamil-s10-w3",
		SeasonID:                  "bb-tamil-s10",
		WeekNumber:                3,
		Title:                     "Week 3 Eviction Poll: Bigg Boss Tamil Season 10",
		Description:               "8 housemates are in danger of eviction this week. Cast your fan vote before Friday midnight!",
		StartsAt:                  now.Add(-48 * time.Hour),
		EndsAt:                    now.Add(48 * time.Hour),
		IsActive:                  true,
		IsClosed:                  false,
		OfficialEvictionAnnounced: false,
		TotalVotes:                18420,
		Nominees: []models.Contestant{
			{
				ID:               "c-tamil-1",
				SeasonID:         "bb-tamil-s10",
				Name:             "Santhosh Prathap",
				NativeName:       "சந்தோஷ் பிரதாப்",
				Slug:             "santhosh-prathap",
				PhotoURL:         "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
				Bio:              "Tamil cinema actor known for Sarpatta Parambarai.",
				Occupation:       "Actor",
				Status:           "in_house",
				VoteCount:        6820,
				VoteShare:        37.0,
			},
			{
				ID:               "c-tamil-2",
				SeasonID:         "bb-tamil-s10",
				Name:             "Pavithra Lakshmi",
				NativeName:       "பவித்ரா லட்சுமி",
				Slug:             "pavithra-lakshmi",
				PhotoURL:         "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
				Bio:              "Cooku with Comali fame and film actress.",
				Occupation:       "Actress, Model",
				Status:           "in_house",
				VoteCount:        6110,
				VoteShare:        33.2,
			},
			{
				ID:               "c-tamil-3",
				SeasonID:         "bb-tamil-s10",
				Name:             "Gopinath Ravi",
				NativeName:       "கோபிநாத் ரவி",
				Slug:             "gopinath-ravi",
				PhotoURL:         "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
				Bio:              "Fitness model and Rubaru Mr India winner.",
				Occupation:       "Model, Actor",
				Status:           "in_house",
				VoteCount:        5490,
				VoteShare:        29.8,
			},
		},
		Show: &s.shows[1],
	}

	// Telugu Season 10 Week 3 Active
	teluguWeek3 := &models.NominationWeek{
		ID:                        "bb-telugu-s10-w3",
		SeasonID:                  "bb-telugu-s10",
		WeekNumber:                3,
		Title:                     "Week 3 Eviction Poll: Bigg Boss Telugu Season 10",
		Description:               "Save your favourite Telugu housemate before the weekend eviction with Nagarjuna.",
		StartsAt:                  now.Add(-48 * time.Hour),
		EndsAt:                    now.Add(48 * time.Hour),
		IsActive:                  true,
		IsClosed:                  false,
		OfficialEvictionAnnounced: false,
		TotalVotes:                11340,
		Nominees: []models.Contestant{
			{
				ID:               "c-telugu-1",
				SeasonID:         "bb-telugu-s10",
				Name:             "Aman Masood",
				NativeName:       "అమన్ మసూద్",
				Slug:             "aman-masood",
				PhotoURL:         "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
				Bio:              "Tollywood actor and serial star.",
				Occupation:       "Actor",
				Status:           "in_house",
				VoteCount:        6420,
				VoteShare:        56.6,
			},
			{
				ID:               "c-telugu-2",
				SeasonID:         "bb-telugu-s10",
				Name:             "Damera Shalini",
				NativeName:       "దామెర శాలిని పటేల్",
				Slug:             "damera-shalini",
				PhotoURL:         "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
				Bio:              "Digital content creator and lifestyle vlogger.",
				Occupation:       "Digital Creator",
				Status:           "in_house",
				VoteCount:        4920,
				VoteShare:        43.4,
			},
		},
		Show: &s.shows[2],
	}

	s.weeks[hindiWeek3.ID] = hindiWeek3
	s.weeks[tamilWeek3.ID] = tamilWeek3
	s.weeks[teluguWeek3.ID] = teluguWeek3

	// Add sample chats
	s.chatMessages[hindiWeek3.ID] = []models.ChatMessage{
		{
			ID:          "m1",
			WeekID:      hindiWeek3.ID,
			DeviceID:    "admin",
			Nickname:    "PulseMod",
			AvatarColor: "#EF4444",
			Content:     "🔥 Live Week 3 discussion is open! Vote daily once per device until Friday night.",
			IsPinned:    true,
			CreatedAt:   now.Add(-24 * time.Hour),
		},
		{
			ID:          "m2",
			WeekID:      hindiWeek3.ID,
			DeviceID:    "fan-1",
			Nickname:    "YungArmy",
			AvatarColor: "#F59E0B",
			Content:     "Just voted for Yung DSA! Straight out of Yerawada, he needs to stay!",
			CreatedAt:   now.Add(-3 * time.Hour),
		},
		{
			ID:          "m3",
			WeekID:      hindiWeek3.ID,
			DeviceID:    "fan-2",
			Nickname:    "DesiViewer",
			AvatarColor: "#3B82F6",
			Content:     "Isha didn't get involved in petty fights. Real maturity. Voted for her today.",
			CreatedAt:   now.Add(-45 * time.Minute),
		},
	}

	GlobalStore = s
}

// GetShows returns all available Bigg Boss shows
func (s *Store) GetShows() []models.Show {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.shows
}

// GetShowBySlug returns a single show
func (s *Store) GetShowBySlug(slug string) (*models.Show, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, show := range s.shows {
		if show.Slug == slug {
			return &show, nil
		}
	}
	return nil, errors.New("show not found")
}

// GetActivePolls returns all active nomination polls across languages
func (s *Store) GetActivePolls() []*models.NominationWeek {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var active []*models.NominationWeek
	for _, w := range s.weeks {
		if w.IsActive {
			active = append(active, w)
		}
	}
	return active
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

// GetChatMessages retrieves live comments for a week
func (s *Store) GetChatMessages(weekID string) []models.ChatMessage {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.chatMessages[weekID]
}

// AddChatMessage posts a new comment
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

// GetWeekArchive returns completed previous weeks with eviction results
func (s *Store) GetWeekArchive(showSlug string) []models.NominationWeek {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Return mock completed weeks
	return []models.NominationWeek{
		{
			ID:                        "bb-hindi-s20-w2",
			SeasonID:                  "bb-hindi-s20",
			WeekNumber:                2,
			Title:                     "Week 2 Eviction: Aasif, Rohed & ScoutOP",
			Description:               "Direct nominations after rule violations.",
			StartsAt:                  time.Now().Add(-14 * 24 * time.Hour),
			EndsAt:                    time.Now().Add(-7 * 24 * time.Hour),
			IsActive:                  false,
			IsClosed:                  true,
			OfficialEvictionAnnounced: true,
			TotalVotes:                8950,
			Nominees: []models.Contestant{
				{
					ID:         "c-scout",
					Name:       "Tanmay Singh (ScoutOP)",
					NativeName: "तन्मय सिंह (स्काउटओपी)",
					PhotoURL:   "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
					VoteCount:  4810,
					VoteShare:  53.7,
					Status:     "in_house",
					IsEvicted:  false,
				},
				{
					ID:         "c-aasif",
					Name:       "Aasif Khan",
					NativeName: "आसिफ खान",
					PhotoURL:   "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
					VoteCount:  2410,
					VoteShare:  26.9,
					Status:     "in_house",
					IsEvicted:  false,
				},
				{
					ID:         "c-rohed",
					Name:       "Rohed Khan",
					NativeName: "रोहेद खान",
					PhotoURL:   "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
					VoteCount:  1730,
					VoteShare:  19.3,
					Status:     "evicted",
					IsEvicted:  true,
				},
			},
		},
		{
			ID:                        "bb-hindi-s20-w1",
			SeasonID:                  "bb-hindi-s20",
			WeekNumber:                1,
			Title:                     "Week 1 Opening Nominations",
			Description:               "First week nominations: Uditi Singh lost life token, no eviction occurred.",
			StartsAt:                  time.Now().Add(-21 * 24 * time.Hour),
			EndsAt:                    time.Now().Add(-14 * 24 * time.Hour),
			IsActive:                  false,
			IsClosed:                  true,
			OfficialEvictionAnnounced: true,
			TotalVotes:                4210,
			Nominees: []models.Contestant{
				{
					ID:         "c-arishfa",
					Name:       "Sayyed Arishfa Khan",
					NativeName: "सैयद अरिशफा खान",
					PhotoURL:   "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
					VoteCount:  1850,
					VoteShare:  43.9,
					Status:     "in_house",
					IsEvicted:  false,
				},
				{
					ID:         "c-uditi",
					Name:       "Uditi Singh",
					NativeName: "उदिति सिंह",
					PhotoURL:   "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
					VoteCount:  750,
					VoteShare:  17.8,
					Status:     "in_house",
					IsEvicted:  false,
				},
			},
		},
	}
}
