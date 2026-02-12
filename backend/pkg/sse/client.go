package sse

import (
	"net/http"
)

// Client represents a single SSE Client connection
type Client struct {
	writer  http.ResponseWriter
	flusher http.Flusher
}
