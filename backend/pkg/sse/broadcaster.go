package sse

import (
	"encoding/json"
	"fmt"
)

func (h *Hub) Broadcast(data []byte) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	// For each client
	for c := range h.clients {

		// send data
		if _, err := fmt.Fprintf(c.writer,
			"data:%s\n\n",
			data,
		); err != nil {
			// if error during connection remove
			h.loggger.Debug().Msg("Client disconnected")
			delete(h.clients, c)
			continue
		}
		c.flusher.Flush()
	}
}

func (h *Hub) BroadcastJSON(v any) error {
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}
	h.Broadcast(data)
	return nil
}
