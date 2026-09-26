package service

import (
	"fmt"
	"testing"

	"github.com/biggboss/pulse/internal/models"
)

func TestEphemeralGuestChat(t *testing.T) {
	weekID := "test-week-ephemeral-101"

	// Post 5 messages
	for i := 1; i <= 5; i++ {
		req := models.ChatRequest{
			WeekID:      weekID,
			DeviceID:    fmt.Sprintf("dev-%d", i),
			Nickname:    fmt.Sprintf("Fan_%04d", i),
			AvatarColor: "#3B82F6",
			Content:     fmt.Sprintf("Test ephemeral opinion %d", i),
		}
		msg, err := AddEphemeralChatMessage(req)
		if err != nil {
			t.Fatalf("AddEphemeralChatMessage failed for msg %d: %v", i, err)
		}
		if msg.ID == "" {
			t.Errorf("Expected message ID for msg %d", i)
		}
	}

	// Fetch messages
	msgs := GetEphemeralChatMessages(weekID)
	if len(msgs) != 5 {
		t.Fatalf("Expected 5 messages, got %d", len(msgs))
	}

	// Test Pin
	firstMsgID := msgs[0].ID
	if err := PinEphemeralChatMessage(weekID, firstMsgID); err != nil {
		t.Fatalf("PinEphemeralChatMessage failed: %v", err)
	}

	msgsAfterPin := GetEphemeralChatMessages(weekID)
	if !msgsAfterPin[0].IsPinned {
		t.Error("Expected first message to be marked pinned")
	}

	// Test Delete
	if err := DeleteEphemeralChatMessage(weekID, firstMsgID); err != nil {
		t.Fatalf("DeleteEphemeralChatMessage failed: %v", err)
	}

	msgsAfterDel := GetEphemeralChatMessages(weekID)
	if len(msgsAfterDel) != 4 {
		t.Errorf("Expected 4 messages after deletion, got %d", len(msgsAfterDel))
	}
}

func TestEphemeralChatMaxCapacity(t *testing.T) {
	weekID := "test-week-cap"

	// Post more than limit (limit is 50)
	for i := 1; i <= 55; i++ {
		_, _ = AddEphemeralChatMessage(models.ChatRequest{
			WeekID:   weekID,
			DeviceID: "dev",
			Content:  fmt.Sprintf("Msg %d", i),
		})
	}

	msgs := GetEphemeralChatMessages(weekID)
	if len(msgs) > 50 {
		t.Errorf("Ephemeral messages exceeded cap of 50, got %d", len(msgs))
	}
}
