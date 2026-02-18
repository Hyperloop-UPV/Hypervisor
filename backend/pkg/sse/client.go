package sse

import (
	"net/http"
	"sync"
)

// Client represents a single SSE Client connection
type Client struct {
	writer  http.ResponseWriter
	flusher http.Flusher
	mu      sync.Mutex
	req     *http.Request
	send    chan []byte // buffer 1: keep-latest
	ip      string
	ua      string
}
