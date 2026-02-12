package sse

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/Hyperloop-UPV/Hypervisor/pkg/logger/status"
)

func (h *Hub) Broadcast(data []byte) {

	h.mutex.Lock()

	clients := make(map[*Client]struct{})
	for c := range h.clients {
		clients[c] = struct{}{}
	}

	h.mutex.Unlock()

	for c := range clients {

		// send data
		if _, err := fmt.Fprintf(c.writer,
			"data: %s\n\n",
			data,
		); err != nil {
			// if error during connection remove
			h.trace.Debug().Msg("Client disconnected")

			fmt.Printf("Client disconnected: %v\n", err)

			h.statusLogger.PushRecord(&status.Record{
				IP:             c.writer.Header().Get("X-Forwarded-For"),
				UA:             c.writer.Header().Get("User-Agent"),
				ConnectionType: "DISCONNECTION",
				Timestamp:      time.Now(),
			})

			h.mutex.Lock()
			delete(h.clients, c)
			h.mutex.Unlock()
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
