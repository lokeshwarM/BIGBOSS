package auth

import (
	"testing"
	"time"
)

func TestGenerateAndValidateToken(t *testing.T) {
	userID := "usr-1234-uuid"
	email := "fan@biggboss.community"
	role := "user"
	nickname := "Fan_4821"
	color := "#3B82F6"

	token, err := GenerateToken(userID, email, role, nickname, color)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}
	if token == "" {
		t.Fatal("Expected non-empty token")
	}

	claims, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("ValidateToken failed: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("Expected UserID %s, got %s", userID, claims.UserID)
	}
	if claims.Email != email {
		t.Errorf("Expected Email %s, got %s", email, claims.Email)
	}
	if claims.Role != role {
		t.Errorf("Expected Role %s, got %s", role, claims.Role)
	}
	if claims.PublicNickname != nickname {
		t.Errorf("Expected PublicNickname %s, got %s", nickname, claims.PublicNickname)
	}
	if claims.AvatarColor != color {
		t.Errorf("Expected AvatarColor %s, got %s", color, claims.AvatarColor)
	}
}

func TestValidateInvalidToken(t *testing.T) {
	_, err := ValidateToken("invalid.token.string")
	if err == nil {
		t.Error("Expected error for invalid token, got nil")
	}
}

func TestVerifyGoogleMockToken(t *testing.T) {
	mockToken := "mock_google_token_testuser@gmail.com"
	info, err := VerifyGoogleIDToken(mockToken)
	if err != nil {
		t.Fatalf("VerifyGoogleIDToken failed: %v", err)
	}
	if info.Email != "testuser@gmail.com" {
		t.Errorf("Expected email testuser@gmail.com, got %s", info.Email)
	}
	if info.Sub == "" {
		t.Error("Expected non-empty sub ID")
	}
}

func TestTokenExpiration(t *testing.T) {
	// Verify that token has valid future expiration
	token, err := GenerateToken("uid", "email@test.com", "user", "Fan_9999", "#F59E0B")
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}
	claims, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("ValidateToken failed: %v", err)
	}
	if claims.ExpiresAt.Time.Before(time.Now()) {
		t.Error("Token should not be expired upon creation")
	}
}
