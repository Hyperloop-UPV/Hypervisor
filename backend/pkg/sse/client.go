package sse

import (
	"net/http"
)

// client represents a single SSE client connection
type client struct {
	writer  http.ResponseWriter
	flusher http.Flusher
}
