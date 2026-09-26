package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/biggboss/pulse/internal/auth"
	"github.com/biggboss/pulse/internal/models"
)

func TestHealthCheck(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rr := httptest.NewRecorder()

	HealthCheck(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rr.Code)
	}

	var res map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &res); err != nil {
		t.Fatalf("Failed to parse json: %v", err)
	}
	if res["status"] != "healthy" {
		t.Errorf("Expected status healthy, got %v", res["status"])
	}
}

func TestCastVoteMissingFields(t *testing.T) {
	// Missing contestant_id
	payload := []byte(`{"week_id":"w1","device_id":"d1"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/polls/vote", bytes.NewBuffer(payload))
	rr := httptest.NewRecorder()

	CastVote(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for missing contestant_id, got %d", rr.Code)
	}
}

func TestRequireAdminRejectsUnauthorized(t *testing.T) {
	os.Setenv("ENV", "production")
	os.Setenv("ADMIN_SECRET", "super_secret_admin_key_test_123")
	defer os.Unsetenv("ENV")
	defer os.Unsetenv("ADMIN_SECRET")

	req := httptest.NewRequest(http.MethodGet, "/api/admin/data", nil)
	rr := httptest.NewRecorder()

	AdminGetAllDataHandler(rr, req)

	if rr.Code != http.StatusForbidden && rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401 or 403 for unauthenticated admin access, got %d", rr.Code)
	}
}

func TestRequireAdminAcceptsValidAdminToken(t *testing.T) {
	os.Setenv("ADMIN_SECRET", "super_secret_admin_key_test_123")
	defer os.Unsetenv("ADMIN_SECRET")

	// Generate admin token
	adminToken, err := auth.GenerateToken("admin-uid", "admin@biggboss.community", "admin", "AdminBoss", "#EF4444")
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/admin/data", nil)
	req.Header.Set("Authorization", "Bearer "+adminToken)
	rr := httptest.NewRecorder()

	AdminGetAllDataHandler(rr, req)

	// Should not be 401 or 403
	if rr.Code == http.StatusUnauthorized || rr.Code == http.StatusForbidden {
		t.Errorf("Admin with valid token should not be rejected, got %d", rr.Code)
	}
}

func TestRequireAuthRejectsGuestPostCreation(t *testing.T) {
	payload := []byte(`{"season_id":"s1","content":"Test opinion"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/posts", bytes.NewBuffer(payload))
	rr := httptest.NewRecorder()

	PostsHandler(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401 Unauthorized for unauthenticated post creation, got %d", rr.Code)
	}
}

func TestDevLoginResponsePrivacy(t *testing.T) {
	payload := []byte(`{"email":"private_user@example.com","public_nickname":"Fan_3321"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/auth/dev-login", bytes.NewBuffer(payload))
	rr := httptest.NewRecorder()

	DevLoginHandler(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for dev login, got %d", rr.Code)
	}

	var res models.AuthResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &res); err != nil {
		t.Fatalf("Failed to parse json: %v", err)
	}

	if res.Token == "" {
		t.Error("Expected token in response")
	}
	if res.User.PublicNickname != "Fan_3321" {
		t.Errorf("Expected PublicNickname Fan_3321, got %s", res.User.PublicNickname)
	}
}
