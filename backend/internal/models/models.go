package models

import (
	"time"
)

// Show represents a regional Bigg Boss language show
type Show struct {
	ID           string    `json:"id"`
	Slug         string    `json:"slug"`
	Name         string    `json:"name"`
	Language     string    `json:"language"`
	Broadcaster  string    `json:"broadcaster"`
	HostName     string    `json:"host_name"`
	LogoURL      string    `json:"logo_url"`
	BannerURL    string    `json:"banner_url"`
	AccentColor  string    `json:"accent_color"`
	IsActive     bool      `json:"is_active"`
	DisplayOrder int       `json:"display_order"`
	CreatedAt    time.Time `json:"created_at"`
}

// Season represents a specific season of a show
type Season struct {
	ID                   string          `json:"id"`
	ShowID               string          `json:"show_id"`
	ShowSlug             string          `json:"show_slug,omitempty"`
	SeasonNumber         int             `json:"season_number"`
	Title                string          `json:"title"`
	Tagline              string          `json:"tagline"`
	Year                 int             `json:"year"`
	Status               string          `json:"status"` // 'upcoming', 'ongoing', 'completed'
	TotalContestants     int             `json:"total_contestants"`
	RemainingContestants int             `json:"remaining_contestants"`
	Contestants          []Contestant    `json:"contestants,omitempty"`
	ActiveWeek           *NominationWeek `json:"active_week,omitempty"`
	CreatedAt            time.Time       `json:"created_at"`
}

// Contestant represents a housemate
type Contestant struct {
	ID               string  `json:"id"`
	SeasonID         string  `json:"season_id"`
	Name             string  `json:"name"`
	NativeName       string  `json:"native_name"`
	Slug             string  `json:"slug"`
	PhotoURL         string  `json:"photo_url"`
	Bio              string  `json:"bio"`
	Occupation       string  `json:"occupation"`
	City             string  `json:"city,omitempty"`
	InstagramHandle  string  `json:"instagram_handle,omitempty"`
	Status           string  `json:"status"`     // 'in_house', 'evicted', 'winner', 'runner_up'
	EntryType        string  `json:"entry_type"` // 'original', 'wildcard'
	NominationsCount int     `json:"nominations_count"`
	VoteShare        float64 `json:"vote_share,omitempty"`
	VoteCount        int64   `json:"vote_count,omitempty"`
	IsEvicted        bool    `json:"is_evicted,omitempty"`
	EvictionReason   string  `json:"eviction_reason,omitempty"`
}

// NominationWeek represents a weekly voting window (Mon night - Fri night)
type NominationWeek struct {
	ID                          string       `json:"id"`
	SeasonID                    string       `json:"season_id"`
	ShowSlug                    string       `json:"show_slug,omitempty"`
	SeasonNumber                int          `json:"season_number,omitempty"`
	WeekNumber                  int          `json:"week_number"`
	Title                       string       `json:"title"`
	Description                 string       `json:"description"`
	StartsAt                    time.Time    `json:"starts_at"`
	EndsAt                      time.Time    `json:"ends_at"`
	IsActive                    bool         `json:"is_active"`
	IsClosed                    bool         `json:"is_closed"`
	OfficialEvictionAnnounced   bool         `json:"official_eviction_announced"`
	OfficialEvictedContestantID *string      `json:"official_evicted_contestant_id,omitempty"`
	TotalVotes                  int64        `json:"total_votes"`
	Nominees                    []Contestant `json:"nominees,omitempty"`
	Show                        *Show        `json:"show,omitempty"`
}

// DeviceAccount represents an anonymous 1-click guest user
type DeviceAccount struct {
	ID          string    `json:"id"`
	DeviceID    string    `json:"device_id"`
	Nickname    string    `json:"nickname"`
	AvatarColor string    `json:"avatar_color"`
	Email       string    `json:"email,omitempty"`
	IsVerified  bool      `json:"is_verified"`
	CreatedAt   time.Time `json:"created_at"`
}

// Vote represents a cast vote
type Vote struct {
	ID           string    `json:"id"`
	WeekID       string    `json:"week_id"`
	ContestantID string    `json:"contestant_id"`
	DeviceID     string    `json:"device_id"`
	VotedDate    string    `json:"voted_date"`
	CreatedAt    time.Time `json:"created_at"`
}

// VoteRequest is the incoming payload when user clicks to vote
type VoteRequest struct {
	WeekID       string `json:"week_id"`
	ContestantID string `json:"contestant_id"`
	DeviceID     string `json:"device_id"`
	Nickname     string `json:"nickname,omitempty"`
}

// VoteResponse is returned after casting a vote
type VoteResponse struct {
	Success       bool         `json:"success"`
	Message       string       `json:"message"`
	HasVotedToday bool         `json:"has_voted_today"`
	VotedForID    string       `json:"voted_for_id,omitempty"`
	TotalVotes    int64        `json:"total_votes"`
	Standings     []Contestant `json:"standings"`
}

// ChatMessage represents a live discussion comment
type ChatMessage struct {
	ID          string    `json:"id"`
	WeekID      string    `json:"week_id"`
	DeviceID    string    `json:"device_id"`
	Nickname    string    `json:"nickname"`
	AvatarColor string    `json:"avatar_color"`
	Content     string    `json:"content"`
	IsPinned    bool      `json:"is_pinned"`
	CreatedAt   time.Time `json:"created_at"`
}

// ChatRequest is incoming comment
type ChatRequest struct {
	WeekID      string `json:"week_id"`
	DeviceID    string `json:"device_id"`
	Nickname    string `json:"nickname"`
	AvatarColor string `json:"avatar_color"`
	Content     string `json:"content"`
}
