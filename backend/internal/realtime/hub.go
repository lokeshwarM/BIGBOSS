package realtime

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// TODO: In production, restrict to known origins
		return true
	},
}

// Client represents a connected WebSocket user
type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	weekID   string
	deviceID string
}

// Hub manages active client connections with per-week room support
type Hub struct {
	mu         sync.RWMutex
	clients    map[*Client]bool
	rooms      map[string]map[*Client]bool // weekID -> clients
	broadcast  chan BroadcastMsg
	register   chan *Client
	unregister chan *Client
}

type BroadcastMsg struct {
	WeekID string // empty = broadcast to all
	Data   []byte
}

var GlobalHub *Hub

// InitHub initializes the global realtime hub
func InitHub() {
	GlobalHub = &Hub{
		clients:    make(map[*Client]bool),
		rooms:      make(map[string]map[*Client]bool),
		broadcast:  make(chan BroadcastMsg, 512),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
	go GlobalHub.run()
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			if client.weekID != "" {
				if h.rooms[client.weekID] == nil {
					h.rooms[client.weekID] = make(map[*Client]bool)
				}
				h.rooms[client.weekID][client] = true
			}
			h.mu.Unlock()
			log.Printf("🔌 WS client connected weekID=%s (total=%d)", client.weekID, len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				if client.weekID != "" {
					delete(h.rooms[client.weekID], client)
				}
			}
			h.mu.Unlock()
			log.Printf("🔌 WS client disconnected (total=%d)", len(h.clients))

		case msg := <-h.broadcast:
			h.mu.RLock()
			var targets map[*Client]bool
			if msg.WeekID != "" {
				targets = h.rooms[msg.WeekID]
			} else {
				targets = h.clients
			}
			for client := range targets {
				select {
				case client.send <- msg.Data:
				default:
					// Slow client — drop the message but don't block hub
				}
			}
			h.mu.RUnlock()
		}
	}
}

// BroadcastToWeek sends a JSON event only to clients in the given week's room
func BroadcastToWeek(weekID string, eventType string, payload any) {
	if GlobalHub == nil {
		return
	}
	data, err := json.Marshal(map[string]any{
		"type":    eventType,
		"payload": payload,
	})
	if err != nil {
		return
	}
	GlobalHub.broadcast <- BroadcastMsg{WeekID: weekID, Data: data}
}

// BroadcastEvent sends a JSON event to ALL connected clients (global)
func BroadcastEvent(eventType string, payload any) {
	if GlobalHub == nil {
		return
	}
	data, err := json.Marshal(map[string]any{
		"type":    eventType,
		"payload": payload,
	})
	if err != nil {
		return
	}
	GlobalHub.broadcast <- BroadcastMsg{Data: data}
}

// ServeWs handles WebSocket upgrade and client registration
func ServeWs(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	weekID := r.URL.Query().Get("week_id")
	deviceID := r.URL.Query().Get("device_id")

	client := &Client{
		hub:      GlobalHub,
		conn:     conn,
		send:     make(chan []byte, 256),
		weekID:   weekID,
		deviceID: deviceID,
	}

	client.hub.register <- client

	go client.writePump()
	go client.readPump()
}

const (
	writeWait  = 10 * time.Second
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
)

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("ws error: %v", err)
			}
			break
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)
			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
