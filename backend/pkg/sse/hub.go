package sse

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/Hyperloop-UPV/Hypervisor/pkg/abstraction"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/logger/status"
	"github.com/rs/zerolog"
)

// Hub maintains the set of active clients and broadcasts messages to the clients.
type Hub struct {
	mutex          sync.Mutex
	clients        map[*Client]struct{} // set of clients
	initialMessage []byte
	trace          zerolog.Logger
	statusLogger   abstraction.Logger
}

// NewHub creates a new Hub
func NewHub(trace zerolog.Logger, initialMessage []byte, statusLogger abstraction.Logger) *Hub {
	return &Hub{
		clients:        make(map[*Client]struct{}),
		initialMessage: initialMessage,
		trace:          trace,
		statusLogger:   statusLogger,
	}
}

func (h *Hub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Headers CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {

		// logger to log error
		h.trace.Error().Msg("Streaming unsupported")
		return
	}

	// Start connection
	fmt.Fprint(w, ": init\n\n")
	flusher.Flush()

	c := &Client{
		writer:  w,
		flusher: flusher,
	}

	// After sending intial message we regdister the client
	h.mutex.Lock()
	h.clients[c] = struct{}{}
	h.mutex.Unlock()

	// Send initial welcome message before registering client
	fmt.Fprintf(c.writer, "data: %s\n\n", h.initialMessage)
	c.flusher.Flush()

	// Log connection to trace
	h.trace.Debug().Msg("New client connected")

	// Log connection to status logger
	h.statusLogger.PushRecord(&status.Record{
		IP:             r.RemoteAddr,
		UA:             r.Header.Get("User-Agent"),
		ConnectionType: "CONNECTION",
		Timestamp:      time.Now(),
	})

	// Wait until connection is colosed
	<-r.Context().Done()

	h.mutex.Lock()
	delete(h.clients, c)
	h.mutex.Unlock()
}

// ClientCount returns the number of clients conected
func (h *Hub) ClientCount() int {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	return len(h.clients)
}
