package sse

import (
	"net/http"
	"sync"
	"time"

	"github.com/Hyperloop-UPV/Hypervisor/pkg/abstraction"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/logger/status"
	"github.com/rs/zerolog"
)

// Hub maintains the set of active clients and broadcasts messages to the clients.
type Hub struct {
	mu             sync.RWMutex
	clients        map[*Client]struct{} // set of clients
	initialMessage []byte
	register       chan *Client
	unregister     chan *Client
	broadcast      chan []byte
	trace          zerolog.Logger
	statusLogger   abstraction.Logger
}

// NewHub creates a new Hub
func NewHub(trace zerolog.Logger, initialMessage []byte, statusLogger abstraction.Logger) *Hub {
	h := &Hub{
		clients: make(map[*Client]struct{}),

		initialMessage: initialMessage,
		trace:          trace,
		statusLogger:   statusLogger,
		register:       make(chan *Client),
		unregister:     make(chan *Client),
		broadcast:      make(chan []byte, 1), // pequeño buffer
	}
	go h.run()
	return h
}

// run defines the main behaviour of a broker
func (h *Hub) run() {
	for {
		select {
		// Register new client
		case c := <-h.register:
			h.mu.Lock()
			h.clients[c] = struct{}{}
			count := len(h.clients)
			h.mu.Unlock()

			// Trace connection
			h.trace.Info().
				Str("ip", c.ip).
				Str("ua", c.ua).
				Int("clients", count).
				Msg("SSE client connected")

			// Status logger
			h.statusLogger.PushRecord(&status.Record{
				IP:               c.ip,
				UA:               c.ua,
				ConnectionType:   "CONNECTION",
				ConnectedDevices: count,
				Timestamp:        time.Now(),
			})

		// Unregister
		case c := <-h.unregister:

			// Remove
			h.mu.Lock()
			if _, ok := h.clients[c]; ok {
				delete(h.clients, c)
				close(c.send)
			}
			count := len(h.clients)
			h.mu.Unlock()

			// Log disconnection
			h.trace.Info().
				Str("ip", c.ip).
				Str("ua", c.ua).
				Int("clients", count).
				Msg("SSE client disconnected")

			h.statusLogger.PushRecord(&status.Record{
				IP:               c.ip,
				UA:               c.ua,
				ConnectionType:   "DISCONNECTION",
				ConnectedDevices: count,
				Timestamp:        time.Now(),
			})

		case msg := <-h.broadcast:
			h.mu.RLock()
			for c := range h.clients {
				select {
				case c.send <- msg:
				default:
					// keep-latest policy
					select {
					case <-c.send:
					default:
					}
					select {
					case c.send <- msg:
					default:
						go func(cc *Client) { h.unregister <- cc }(c)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	f, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	c := &Client{
		writer:  w,
		flusher: f,
		req:     r,
		send:    make(chan []byte, 1), // keep-latest
		ip:      r.RemoteAddr,
		ua:      r.UserAgent(),
	}

	// Send initial message

	if h.initialMessage != nil {
		if _, err := w.Write([]byte("data: ")); err != nil {
			return
		}
		if _, err := w.Write(h.initialMessage); err != nil {
			return
		}
		if _, err := w.Write([]byte("\n\n")); err != nil {
			return
		}
		f.Flush()
	}

	h.register <- c
	defer func() { h.unregister <- c }()

	ctx := r.Context()

	for {
		select {
		case msg, ok := <-c.send:
			if !ok {
				return
			}
			// SSE: data: <payload>\n\n
			_, err := c.writer.Write([]byte("data: "))
			if err != nil {
				return
			}
			_, err = c.writer.Write(msg)
			if err != nil {
				return
			}
			_, err = c.writer.Write([]byte("\n\n"))
			if err != nil {
				return
			}
			c.flusher.Flush()

		case <-ctx.Done():
			return
		}
	}
}

// ClientCount returns the number of clients conected
func (h *Hub) ClientCount() int {
	h.mu.Lock()
	defer h.mu.Unlock()

	return len(h.clients)
}
