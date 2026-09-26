package models

import "time"

// AdminCreateShowRequest
type AdminCreateShowRequest struct {
	Slug        string `json:"slug"`
	Name        string `json:"name"`
	Language    string `json:"language"`
	Broadcaster string `json:"broadcaster"`
	HostName    string `json:"host_name"`
	AccentColor string `json:"accent_color"`
}

// AdminCreateSeasonRequest
type AdminCreateSeasonRequest struct {
	ShowSlug     string `json:"show_slug"`
	SeasonNumber int    `json:"season_number"`
	Title        string `json:"title"`
	Tagline      string `json:"tagline"`
	Year         int    `json:"year"`
	Status       string `json:"status"` // 'ongoing', 'completed', 'upcoming'
	HostName     string `json:"host_name,omitempty"`
}

// AdminUpdateSeasonRequest
type AdminUpdateSeasonRequest struct {
	Title        string `json:"title,omitempty"`
	Tagline      string `json:"tagline,omitempty"`
	Year         int    `json:"year,omitempty"`
	Status       string `json:"status,omitempty"` // 'ongoing', 'completed', 'upcoming'
	HostName     string `json:"host_name,omitempty"`
	SeasonNumber int    `json:"season_number,omitempty"`
}

// AdminCreateContestantRequest
type AdminCreateContestantRequest struct {
	SeasonID        string `json:"season_id"`
	Name            string `json:"name"`
	NativeName      string `json:"native_name"`
	PhotoURL        string `json:"photo_url"`
	Bio             string `json:"bio"`
	Occupation      string `json:"occupation"`
	City            string `json:"city"`
	InstagramHandle string `json:"instagram_handle"`
	Status          string `json:"status"`    // 'in_house', 'evicted', 'winner'
	EntryType       string `json:"entry_type"` // 'original', 'wildcard', 'guest'
}

// AdminCreatePollRequest
type AdminCreatePollRequest struct {
	SeasonID      string    `json:"season_id"`
	WeekNumber    int       `json:"week_number"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	StartsAt      time.Time `json:"starts_at"`
	EndsAt        time.Time `json:"ends_at"`
	NomineeIDs    []string  `json:"nominee_ids"`
}

// AdminEvictContestantRequest
type AdminEvictContestantRequest struct {
	ContestantID   string `json:"contestant_id"`
	EvictionReason string `json:"eviction_reason"` // 'public_vote', 'walkout', 'emergency_exit'
}
