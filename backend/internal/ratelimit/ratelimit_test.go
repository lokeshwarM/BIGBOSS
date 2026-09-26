package ratelimit

import (
	"testing"
)

func TestRateLimiterAllowsBurstThenBlocks(t *testing.T) {
	// Create limiter: 60 tokens/min = 1/sec, capacity 3
	limiter := NewLimiter(60, 3)
	key := "test-client-ip"

	// First 3 should succeed
	for i := 0; i < 3; i++ {
		if !limiter.Allow(key) {
			t.Errorf("Request %d should be allowed within burst capacity", i+1)
		}
	}

	// 4th immediate request should be denied
	if limiter.Allow(key) {
		t.Error("4th request should exceed capacity and be denied")
	}
}
