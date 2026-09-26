package ratelimit

import (
	"sync"
	"time"
)

type visitor struct {
	tokens    float64
	lastCheck time.Time
}

// Limiter manages in-memory rate limiting with token-bucket algorithm
type Limiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	rate     float64       // tokens per second
	capacity float64       // bucket size
	cleanup  time.Duration // how often to purge old entries
}

// NewLimiter creates a thread-safe token bucket rate limiter
func NewLimiter(ratePerMinute int, capacity int) *Limiter {
	l := &Limiter{
		visitors: make(map[string]*visitor),
		rate:     float64(ratePerMinute) / 60.0,
		capacity: float64(capacity),
		cleanup:  5 * time.Minute,
	}

	go l.startCleanup()
	return l
}

// Allow returns true if the request from the key is permitted
func (l *Limiter) Allow(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	v, exists := l.visitors[key]
	if !exists {
		l.visitors[key] = &visitor{
			tokens:    l.capacity - 1,
			lastCheck: now,
		}
		return true
	}

	// Calculate tokens accumulated since last check
	elapsed := now.Sub(v.lastCheck).Seconds()
	v.lastCheck = now
	v.tokens += elapsed * l.rate
	if v.tokens > l.capacity {
		v.tokens = l.capacity
	}

	if v.tokens >= 1.0 {
		v.tokens -= 1.0
		return true
	}

	return false
}

func (l *Limiter) startCleanup() {
	ticker := time.NewTicker(l.cleanup)
	for range ticker.C {
		l.mu.Lock()
		now := time.Now()
		for k, v := range l.visitors {
			if now.Sub(v.lastCheck) > 10*time.Minute {
				delete(l.visitors, k)
			}
		}
		l.mu.Unlock()
	}
}

// Predefined limiters
var (
	VoteLimiter    = NewLimiter(15, 5)  // 15 votes/min burst 5
	PostLimiter    = NewLimiter(20, 5)  // 20 posts/min burst 5
	AuthLimiter    = NewLimiter(10, 3)  // 10 auth/min burst 3
	GeneralLimiter = NewLimiter(120, 30) // 120 req/min burst 30
)
