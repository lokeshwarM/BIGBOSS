package service

import (
	"errors"
	"fmt"
	"math/rand"
	"os"
	"strings"
	"time"

	"github.com/biggboss/pulse/internal/auth"
	"github.com/biggboss/pulse/internal/database"
	"github.com/biggboss/pulse/internal/models"
	"github.com/biggboss/pulse/internal/security"
)

var rnd = rand.New(rand.NewSource(time.Now().UnixNano()))

func generateFanNickname() string {
	return fmt.Sprintf("Fan_%04d", rnd.Intn(9000)+1000)
}

func defaultAvatarColor() string {
	colors := []string{"#F59E0B", "#EF4444", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#06B6D4"}
	return colors[rnd.Intn(len(colors))]
}

func checkIsAdminEmail(email string) bool {
	adminEmails := os.Getenv("ADMIN_EMAILS")
	if adminEmails == "" {
		return false
	}
	email = strings.ToLower(strings.TrimSpace(email))
	for _, admin := range strings.Split(adminEmails, ",") {
		if strings.ToLower(strings.TrimSpace(admin)) == email {
			return true
		}
	}
	return false
}

// AuthenticateWithGoogle validates a Google ID token, upserts user, and generates session JWT
func AuthenticateWithGoogle(req models.GoogleLoginRequest) (*models.AuthResponse, error) {
	if req.IDToken == "" {
		return nil, errors.New("id_token is required")
	}

	info, err := auth.VerifyGoogleIDToken(req.IDToken)
	if err != nil {
		return nil, fmt.Errorf("google authentication failed: %w", err)
	}

	role := "user"
	if checkIsAdminEmail(info.Email) {
		role = "admin"
	}

	nickname := generateFanNickname()
	color := defaultAvatarColor()

	u := models.User{
		Email:             strings.ToLower(strings.TrimSpace(info.Email)),
		Provider:          "google",
		ProviderSubjectID: info.Sub,
		Role:              role,
		PublicNickname:    nickname,
		AvatarColor:       color,
	}

	var user *models.User
	if database.IsConnected() {
		user, err = database.UpsertUser(u)
		if err != nil {
			return nil, fmt.Errorf("failed to save user: %w", err)
		}
		if req.DeviceID != "" {
			_ = database.LinkUserDevice(user.ID, req.DeviceID)
		}
	} else {
		// Memory fallback
		user = &u
		user.ID = fmt.Sprintf("usr-%d", time.Now().UnixNano())
		user.CreatedAt = time.Now()
	}

	token, err := auth.GenerateToken(user.ID, user.Email, user.Role, user.PublicNickname, user.AvatarColor)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &models.AuthResponse{
		Token: token,
		User: models.UserProfileDTO{
			ID:             user.ID,
			Email:          user.Email,
			Role:           user.Role,
			PublicNickname: user.PublicNickname,
			Nickname:       user.PublicNickname,
			AvatarColor:    user.AvatarColor,
			CreatedAt:      user.CreatedAt,
		},
	}, nil
}

// DevLogin authenticates with email for local development and testing
func DevLogin(req models.DevLoginRequest) (*models.AuthResponse, error) {
	if req.Email == "" {
		req.Email = "fan@biggboss.community"
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	role := "user"
	if req.Role == "admin" || checkIsAdminEmail(req.Email) {
		role = "admin"
	}

	nickname := req.PublicNickname
	if nickname == "" {
		nickname = req.Nickname
	}
	if nickname == "" {
		nickname = generateFanNickname()
	}
	color := req.AvatarColor
	if color == "" {
		color = defaultAvatarColor()
	}

	u := models.User{
		Email:             req.Email,
		Provider:          "dev",
		ProviderSubjectID: "dev-" + req.Email,
		Role:              role,
		PublicNickname:    security.SanitizeText(nickname, 32),
		AvatarColor:       color,
	}

	var user *models.User
	var err error
	if database.IsConnected() {
		user, err = database.UpsertUser(u)
		if err != nil {
			return nil, fmt.Errorf("failed to save dev user: %w", err)
		}
		if req.DeviceID != "" {
			_ = database.LinkUserDevice(user.ID, req.DeviceID)
		}
	} else {
		user = &u
		user.ID = fmt.Sprintf("usr-%d", time.Now().UnixNano())
		user.CreatedAt = time.Now()
	}

	token, err := auth.GenerateToken(user.ID, user.Email, user.Role, user.PublicNickname, user.AvatarColor)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &models.AuthResponse{
		Token: token,
		User: models.UserProfileDTO{
			ID:             user.ID,
			Email:          user.Email,
			Role:           user.Role,
			PublicNickname: user.PublicNickname,
			Nickname:       user.PublicNickname,
			AvatarColor:    user.AvatarColor,
			CreatedAt:      user.CreatedAt,
		},
	}, nil
}

// GetUserProfile retrieves the private profile of the authenticated user
func GetUserProfile(userID string) (*models.UserProfileDTO, error) {
	if database.IsConnected() {
		u, err := database.GetUserByID(userID)
		if err != nil {
			return nil, err
		}
		return &models.UserProfileDTO{
			ID:             u.ID,
			Email:          u.Email,
			Role:           u.Role,
			PublicNickname: u.PublicNickname,
			Nickname:       u.PublicNickname,
			AvatarColor:    u.AvatarColor,
			CreatedAt:      u.CreatedAt,
		}, nil
	}
	return nil, errors.New("user profile not found")
}

// UpdateUserProfile updates public nickname or avatar color
func UpdateUserProfile(userID, nickname, avatarColor string) (*models.UserProfileDTO, error) {
	nickname = security.SanitizeText(nickname, 32)
	if nickname == "" {
		return nil, errors.New("nickname cannot be empty")
	}
	if avatarColor == "" {
		avatarColor = "#F59E0B"
	}

	if database.IsConnected() {
		if err := database.UpdateUserPublicProfile(userID, nickname, avatarColor); err != nil {
			return nil, err
		}
		return GetUserProfile(userID)
	}
	return nil, errors.New("database not connected")
}
