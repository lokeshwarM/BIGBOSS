package service

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/biggboss/pulse/internal/database"
	"github.com/biggboss/pulse/internal/models"
	"github.com/biggboss/pulse/internal/security"
)

// ============================================================
// EPHEMERAL GUEST CHAT (TEMPORARY / IN-MEMORY ONLY)
// ============================================================
// As required by the specification:
// "GUEST DISCUSSION: Anonymous guest discussion can participate, see live discussion,
//  can post, can interact, but should NOT create permanent social history."
// Messages are kept in a sliding in-memory window (up to 50 per week) and NOT written to DB.

type EphemeralChatStore struct {
	mu       sync.RWMutex
	messages map[string][]models.ChatMessage // weekID -> messages
	limit    int
}

var ephemeralChat = &EphemeralChatStore{
	messages: make(map[string][]models.ChatMessage),
	limit:    50,
}

// GetEphemeralChatMessages returns recent temporary guest messages for a week room
func GetEphemeralChatMessages(weekID string) []models.ChatMessage {
	ephemeralChat.mu.RLock()
	defer ephemeralChat.mu.RUnlock()
	msgs := ephemeralChat.messages[weekID]
	if msgs == nil {
		return []models.ChatMessage{}
	}
	// Return a copy
	out := make([]models.ChatMessage, len(msgs))
	copy(out, msgs)
	return out
}

// AddEphemeralChatMessage adds a guest message to the temporary in-memory store
func AddEphemeralChatMessage(req models.ChatRequest) (*models.ChatMessage, error) {
	content := security.SanitizeText(req.Content, 500)
	if content == "" {
		return nil, errors.New("message cannot be empty")
	}

	nickname := security.SanitizeText(req.Nickname, 32)
	if nickname == "" {
		nickname = "Guest_Fan"
	}
	color := req.AvatarColor
	if color == "" {
		color = "#F59E0B"
	}

	msg := models.ChatMessage{
		ID:          fmt.Sprintf("ephemeral_%d", time.Now().UnixNano()),
		WeekID:      req.WeekID,
		DeviceID:    req.DeviceID,
		Nickname:    nickname,
		AvatarColor: color,
		Content:     content,
		IsPinned:    false,
		CreatedAt:   time.Now(),
	}

	ephemeralChat.mu.Lock()
	defer ephemeralChat.mu.Unlock()

	room := ephemeralChat.messages[req.WeekID]
	room = append(room, msg)
	if len(room) > ephemeralChat.limit {
		room = room[len(room)-ephemeralChat.limit:]
	}
	ephemeralChat.messages[req.WeekID] = room

	return &msg, nil
}

// PinEphemeralChatMessage pins a message in the ephemeral chat room
func PinEphemeralChatMessage(weekID, messageID string) error {
	ephemeralChat.mu.Lock()
	defer ephemeralChat.mu.Unlock()

	room := ephemeralChat.messages[weekID]
	for i := range room {
		if room[i].ID == messageID {
			room[i].IsPinned = true
			return nil
		}
	}
	return errors.New("message not found in active ephemeral room")
}

// DeleteEphemeralChatMessage deletes a message from the ephemeral chat room
func DeleteEphemeralChatMessage(weekID, messageID string) error {
	ephemeralChat.mu.Lock()
	defer ephemeralChat.mu.Unlock()

	room := ephemeralChat.messages[weekID]
	for i, m := range room {
		if m.ID == messageID {
			ephemeralChat.messages[weekID] = append(room[:i], room[i+1:]...)
			return nil
		}
	}
	return errors.New("message not found in active ephemeral room")
}

// ============================================================
// PERSISTENT COMMUNITY POSTS (AUTHENTICATED SOCIAL PARTICIPATION)
// ============================================================

// CreateCommunityPost creates a persistent opinion/post tied to a season/week
func CreateCommunityPost(req models.CreatePostRequest, userID, nickname, color string) (*models.CommunityPost, error) {
	content := security.SanitizeText(req.Content, 1000)
	if content == "" {
		return nil, errors.New("post content cannot be empty")
	}
	if req.SeasonID == "" {
		return nil, errors.New("season_id is required")
	}

	post := models.CommunityPost{
		ShowSlug:          req.ShowSlug,
		SeasonID:          req.SeasonID,
		WeekID:            req.WeekID,
		AuthorNickname:    nickname,
		AuthorAvatarColor: color,
		Content:           content,
	}

	if database.IsConnected() {
		return database.CreateCommunityPost(post, userID)
	}
	return nil, errors.New("database connection required for persistent community posts")
}

// GetCommunityPosts fetches persistent opinions with pagination
func GetCommunityPosts(seasonID, weekID, currentUserID string, limit, offset int) ([]models.CommunityPost, error) {
	if database.IsConnected() {
		return database.GetCommunityPosts(seasonID, weekID, currentUserID, limit, offset)
	}
	return []models.CommunityPost{}, nil
}

// PinCommunityPost pins/unpins a persistent community post
func PinCommunityPost(postID string, isPinned bool) error {
	if database.IsConnected() {
		return database.PinCommunityPost(postID, isPinned)
	}
	return errors.New("database not connected")
}

// HideCommunityPost hides an abusive or removed persistent post
func HideCommunityPost(postID string) error {
	if database.IsConnected() {
		return database.HideCommunityPost(postID)
	}
	return errors.New("database not connected")
}

// ============================================================
// COMMUNITY COMMENTS
// ============================================================

// CreateCommunityComment adds a comment/reply to a persistent post
func CreateCommunityComment(postID, userID, nickname, color, content string) (*models.CommunityComment, error) {
	content = security.SanitizeText(content, 500)
	if content == "" {
		return nil, errors.New("comment content cannot be empty")
	}

	if database.IsConnected() {
		return database.CreateCommunityComment(postID, userID, nickname, color, content)
	}
	return nil, errors.New("database not connected")
}

// GetCommentsByPost returns comments for a post
func GetCommentsByPost(postID string, limit, offset int) ([]models.CommunityComment, error) {
	if database.IsConnected() {
		return database.GetCommentsByPost(postID, limit, offset)
	}
	return []models.CommunityComment{}, nil
}

// DeleteCommunityComment removes a comment
func DeleteCommunityComment(commentID string) error {
	if database.IsConnected() {
		return database.DeleteCommunityComment(commentID)
	}
	return errors.New("database not connected")
}

// ============================================================
// POST REACTIONS
// ============================================================

// TogglePostReaction toggles or updates a reaction on a persistent post
func TogglePostReaction(postID, userID, reactionType string) (*models.ReactionResponse, error) {
	validReactions := map[string]bool{
		"like":     true,
		"love":     true,
		"agree":    true,
		"disagree": true,
		"":         true,
	}
	if !validReactions[reactionType] {
		return nil, errors.New("invalid reaction type (must be like, love, agree, or disagree)")
	}

	if database.IsConnected() {
		return database.TogglePostReaction(postID, userID, reactionType)
	}
	return nil, errors.New("database not connected")
}

// ============================================================
// MODERATION REPORTS
// ============================================================

// CreateModerationReport records a user report for abusive content
func CreateModerationReport(req models.CreateReportRequest, userID, deviceID string) (*models.ModerationReport, error) {
	req.Reason = security.SanitizeText(req.Reason, 256)
	if req.Reason == "" {
		return nil, errors.New("reason is required")
	}
	if req.TargetID == "" {
		return nil, errors.New("target_id is required")
	}

	if database.IsConnected() {
		return database.CreateModerationReport(req, userID, deviceID)
	}
	return nil, errors.New("database not connected")
}

// GetModerationReports fetches reports for admin
func GetModerationReports(status string) ([]models.ModerationReport, error) {
	if database.IsConnected() {
		return database.GetModerationReports(status)
	}
	return []models.ModerationReport{}, nil
}

// ResolveModerationReport marks a report as resolved or dismissed
func ResolveModerationReport(reportID, status string) error {
	if status != "resolved" && status != "dismissed" {
		status = "resolved"
	}
	if database.IsConnected() {
		return database.ResolveModerationReport(reportID, status)
	}
	return errors.New("database not connected")
}
