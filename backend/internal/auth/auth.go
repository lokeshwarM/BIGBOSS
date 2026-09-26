package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	UserContextKey contextKey = "authUser"
)

// AuthClaims represents the JWT payload claims
type AuthClaims struct {
	UserID         string `json:"uid"`
	Email          string `json:"email"`
	Role           string `json:"role"` // 'user', 'admin'
	PublicNickname string `json:"nick"`
	AvatarColor    string `json:"color"`
	jwt.RegisteredClaims
}

// GetJWTSecret retrieves or defaults the JWT signing secret
func GetJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "bigboss_community_jwt_secret_dev_super_safe_key_2026"
	}
	return []byte(secret)
}

// GenerateToken creates a signed JWT for an authenticated user
func GenerateToken(userID, email, role, nickname, color string) (string, error) {
	claims := AuthClaims{
		UserID:         userID,
		Email:          email,
		Role:           role,
		PublicNickname: nickname,
		AvatarColor:    color,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)), // 7 days
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "bigboss-community",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(GetJWTSecret())
}

// ValidateToken parses and validates a JWT token string
func ValidateToken(tokenStr string) (*AuthClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &AuthClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return GetJWTSecret(), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*AuthClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid or expired token")
}

// ExtractTokenFromRequest extracts Bearer token from Authorization header or cookie
func ExtractTokenFromRequest(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		return strings.TrimPrefix(authHeader, "Bearer ")
	}

	// Also check cookie
	if cookie, err := r.Cookie("bb_auth_token"); err == nil {
		return cookie.Value
	}

	return ""
}

// GetUserFromContext retrieves authenticated claims from request context if present
func GetUserFromContext(ctx context.Context) *AuthClaims {
	if val := ctx.Value(UserContextKey); val != nil {
		if claims, ok := val.(*AuthClaims); ok {
			return claims
		}
	}
	return nil
}

// AuthMiddleware injects authenticated claims into request context if valid token exists
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenStr := ExtractTokenFromRequest(r)
		if tokenStr != "" {
			if claims, err := ValidateToken(tokenStr); err == nil {
				ctx := context.WithValue(r.Context(), UserContextKey, claims)
				r = r.WithContext(ctx)
			}
		}
		next.ServeHTTP(w, r)
	})
}

// GoogleTokenInfo contains verified claims from Google Tokeninfo API
type GoogleTokenInfo struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	Aud           string `json:"aud"`
}

// VerifyGoogleIDToken verifies a Google ID token with Google's public endpoint
func VerifyGoogleIDToken(idToken string) (*GoogleTokenInfo, error) {
	if idToken == "" {
		return nil, errors.New("empty id_token")
	}

	// For local testing/dev mocks
	if strings.HasPrefix(idToken, "mock_google_token_") {
		email := strings.TrimPrefix(idToken, "mock_google_token_")
		if !strings.Contains(email, "@") {
			email = email + "@gmail.com"
		}
		return &GoogleTokenInfo{
			Sub:           "google-sub-" + email,
			Email:         email,
			EmailVerified: "true",
			Name:          "Dev Fan",
		}, nil
	}

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Get("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken)
	if err != nil {
		return nil, fmt.Errorf("failed to reach Google tokeninfo: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("google token verification failed with status: %d", resp.StatusCode)
	}

	var info GoogleTokenInfo
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, fmt.Errorf("failed to parse google response: %w", err)
	}

	if info.Email == "" || info.Sub == "" {
		return nil, errors.New("incomplete google token claims")
	}

	return &info, nil
}
