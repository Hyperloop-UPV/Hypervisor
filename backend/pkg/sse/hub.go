package sse

import (
	"net/http"
	"sync"

	"github.com/rs/zerolog"
)

// Hub maintains the set of active clients and broadcasts messages to the clients.
type Hub struct {
	mutex   sync.Mutex
	clients map[*client]struct{} // set of clients

	loggger zerolog.Logger
}

// NewHub creates a new Hub
func NewHub(logger zerolog.Logger) *Hub {
	return &Hub{
		clients: make(map[*client]struct{}),
		loggger: logger,
	}
}

func (h *Hub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Headers SSE
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

	h.mutex.Lock()
	h.clients[c] = struct{}{}
	h.mutex.Unlock()

	<-r.Context().Done()

	h.mutex.Lock()
	delete(h.clients, c)
	h.mutex.Unlock()
}
