package security

import (
	"html"
	"net"
	"net/http"
	"strings"
)

// SanitizeText trims whitespace, escapes HTML characters, and limits string length
func SanitizeText(input string, maxLen int) string {
	clean := strings.TrimSpace(input)
	if maxLen > 0 && len(clean) > maxLen {
		clean = clean[:maxLen]
	}
	return html.EscapeString(clean)
}

// GetClientIP extracts real client IP handling proxies
func GetClientIP(r *http.Request) string {
	// Check X-Forwarded-For
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		parts := strings.Split(xff, ",")
		if len(parts) > 0 {
			ip := strings.TrimSpace(parts[0])
			if ip != "" {
				return ip
			}
		}
	}

	// Check X-Real-IP
	xri := r.Header.Get("X-Real-IP")
	if xri != "" {
		return strings.TrimSpace(xri)
	}

	// Fallback to RemoteAddr
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil && host != "" {
		return host
	}

	return r.RemoteAddr
}
