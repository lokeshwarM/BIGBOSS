package models

import (
	"time"
)

// User represents an internal private user account
type User struct {
	ID                string    `json:"id"`
	Email             string    `json:"email"` // Strictly private - NEVER expose in public community APIs
	Provider          string    `json:"provider"`
	ProviderSubjectID string    `json:"provider_subject_id"`
	Role              string    `json:"role"` // 'user', 'admin'
	PublicNickname    string    `json:"public_nickname"`
	AvatarColor       string    `json:"avatar_color"`
	IsBanned          bool      `json:"is_banned"`
	CreatedAt         time.Time `json:"created_at"`
	LastLoginAt       time.Time `json:"last_login_at"`
}

// UserProfileDTO is returned ONLY to the authenticated user on /api/auth/me
type UserProfileDTO struct {
	ID             string    `json:"id"`
	Email          string    `json:"email"`
	Role           string    `json:"role"`
	PublicNickname string    `json:"public_nickname"`
	Nickname       string    `json:"nickname"` // Convenient alias for frontend
	AvatarColor    string    `json:"avatar_color"`
	CreatedAt      time.Time `json:"created_at"`
}

// AuthResponse is returned on successful authentication
type AuthResponse struct {
	Token string         `json:"token"`
	User  UserProfileDTO `json:"user"`
}

// GoogleLoginRequest payload from frontend Google button
type GoogleLoginRequest struct {
	Credential  string `json:"credential,omitempty"`
	IDToken     string `json:"id_token,omitempty"`
	Nickname    string `json:"nickname,omitempty"`
	AvatarColor string `json:"avatar_color,omitempty"`
	DeviceID    string `json:"device_id,omitempty"`
}

// DevLoginRequest payload for local testing / offline dev
type DevLoginRequest struct {
	Email          string `json:"email"`
	PublicNickname string `json:"public_nickname,omitempty"`
	Nickname       string `json:"nickname,omitempty"`
	AvatarColor    string `json:"avatar_color,omitempty"`
	Role           string `json:"role,omitempty"` // 'user' or 'admin'
	DeviceID       string `json:"device_id,omitempty"`
}

// UpdateProfileRequest allows changing public display nickname or avatar
type UpdateProfileRequest struct {
	PublicNickname string `json:"public_nickname,omitempty"`
	Nickname       string `json:"nickname,omitempty"`
	AvatarColor    string `json:"avatar_color"`
}
