package sse

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/rs/zerolog"
)

// Hub maintains the set of active clients and broadcasts messages to the clients.
type Hub struct {
	mutex          sync.Mutex
	clients        map[*client]struct{} // set of clients
	initialMessage []byte
	loggger        zerolog.Logger
}

// NewHub creates a new Hub
func NewHub(logger zerolog.Logger, initialMessage []byte) *Hub {
	return &Hub{
		clients:        make(map[*client]struct{}),
		initialMessage: initialMessage,
		loggger:        logger,
	}
}

func (h *Hub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Headers CORS

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {

		// logger to log error

		h.loggger.Error().Msg("Streaming unsupported")
		return
	}

	c := &client{
		writer:  w,
		flusher: flusher,
	}

	// Send initial welcome message before registering client
	fmt.Fprintf(c.writer, "data: %s\n\n", h.initialMessage)
	c.flusher.Flush()

	h.loggger.Info().Msg("New client connected")

	// After sending intial message we register the client
	h.mutex.Lock()
	h.clients[c] = struct{}{}
	h.mutex.Unlock()

	<-r.Context().Done()

	h.mutex.Lock()
	delete(h.clients, c)
	h.mutex.Unlock()
}
