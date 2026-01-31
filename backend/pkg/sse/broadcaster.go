package sse

import (
	"encoding/json"
	"fmt"
)

func (h *Hub) Broadcast(event string, data []byte) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	for c := range h.clients {

		if _, err := fmt.Fprintf(c.writer,
			"event: %s\ndata: %s\n\n",
			event, data,
		); err != nil {
			// cliente muerto → eliminar
			delete(h.clients, c)
			continue
		}
		c.flusher.Flush()
	}
}

func (h *Hub) BroadcastJSON(event string, v any) error {
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}
	h.Broadcast(event, data)
	return nil
}
