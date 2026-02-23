package sse

// Broadcast to all the connected clients
func (h *Hub) Broadcast(data []byte) {
	// si prefieres no bloquear nunca:
	select {
	case h.broadcast <- data:
	default:
		// drop si el hub va atrasado (telemetría: ok)
	}
}
