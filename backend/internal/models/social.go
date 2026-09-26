package models

import (
	"time"
)

// CommunityPost represents a persistent opinion/post created by an authenticated user
type CommunityPost struct {
	ID                string    `json:"id"`
	ShowSlug          string    `json:"show_slug"`
	SeasonID          string    `json:"season_id"`
	WeekID            string    `json:"week_id,omitempty"`
	AuthorNickname    string    `json:"author_nickname"`
	Nickname          string    `json:"nickname"` // Friendly alias for frontend
	AuthorAvatarColor string    `json:"author_avatar_color"`
	AvatarColor       string    `json:"avatar_color"` // Friendly alias
	Title             string    `json:"title,omitempty"`
	Content           string    `json:"content"`
	IsPinned          bool      `json:"is_pinned"`
	LikesCount        int       `json:"likes_count"`
	LikeCount         int       `json:"like_count"`
	LovesCount        int       `json:"loves_count"`
	LoveCount         int       `json:"love_count"`
	AgreesCount       int       `json:"agrees_count"`
	AgreeCount        int       `json:"agree_count"`
	DisagreesCount    int       `json:"disagrees_count"`
	DisagreeCount     int       `json:"disagree_count"`
	CommentsCount     int       `json:"comments_count"`
	CommentCount      int       `json:"comment_count"`
	UserReaction      string    `json:"user_reaction,omitempty"` // Current user's reaction: 'like', 'love', 'agree', 'disagree'
	CreatedAt         time.Time `json:"created_at"`
}

// CommunityComment represents a reply to a persistent post
type CommunityComment struct {
	ID                string    `json:"id"`
	PostID            string    `json:"post_id"`
	AuthorNickname    string    `json:"author_nickname"`
	Nickname          string    `json:"nickname"`
	AuthorAvatarColor string    `json:"author_avatar_color"`
	AvatarColor       string    `json:"avatar_color"`
	Content           string    `json:"content"`
	CreatedAt         time.Time `json:"created_at"`
}

// CreatePostRequest is incoming payload to create a persistent post
type CreatePostRequest struct {
	ShowSlug    string `json:"show_slug,omitempty"`
	SeasonID    string `json:"season_id,omitempty"`
	WeekID      string `json:"week_id,omitempty"`
	Title       string `json:"title,omitempty"`
	Content     string `json:"content"`
	Nickname    string `json:"nickname,omitempty"`
	AvatarColor string `json:"avatar_color,omitempty"`
}

// CreateCommentRequest is incoming payload to reply to a post
type CreateCommentRequest struct {
	Content     string `json:"content"`
	Nickname    string `json:"nickname,omitempty"`
	AvatarColor string `json:"avatar_color,omitempty"`
}

// PostReactionRequest is incoming payload to react to a post
type PostReactionRequest struct {
	ReactionType string `json:"reaction_type"` // 'like', 'love', 'agree', 'disagree', or '' to toggle off
}

// ReactionResponse is returned after toggling reaction
type ReactionResponse struct {
	Success        bool           `json:"success"`
	PostID         string         `json:"post_id"`
	UserReaction   string         `json:"user_reaction"`
	ActiveReaction string         `json:"active_reaction"`
	Reactions      map[string]int `json:"reactions"`
	LikesCount     int            `json:"likes_count"`
	LovesCount     int            `json:"loves_count"`
	AgreesCount    int            `json:"agrees_count"`
	DisagreesCount int            `json:"disagrees_count"`
}

// ModerationReport represents an admin report
type ModerationReport struct {
	ID               string    `json:"id"`
	TargetType       string    `json:"target_type"` // 'post', 'comment'
	TargetID         string    `json:"target_id"`
	ReporterNickname string    `json:"reporter_nickname"`
	Reason           string    `json:"reason"`
	Status           string    `json:"status"` // 'pending', 'resolved', 'dismissed'
	CreatedAt        time.Time `json:"created_at"`
}

// CreateReportRequest incoming payload from user
type CreateReportRequest struct {
	TargetType string `json:"target_type"`
	TargetID   string `json:"target_id"`
	Reason     string `json:"reason"`
}
