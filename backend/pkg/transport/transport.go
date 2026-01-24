package transport

import (
	"bytes"
	"fmt"
	"io"
	"net"
	"sync"
	"time"

	"github.com/HyperloopUPV-H8/h9-backend/pkg/abstraction"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/transport/network"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/transport/network/sniffer"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/transport/network/udp"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/transport/presentation"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/transport/session"
	"github.com/rs/zerolog"
)

// Transport is the module in charge of handling network communication with
// the vehicle.
//
// It uses events to differentiate different kinds of messages. Each message
// or notification has an associated event which is used to determine the
// action to take.
type Transport struct {
	decoder *presentation.Decoder
	encoder *presentation.Encoder

	connectionsMx *sync.Mutex
	connections   map[abstraction.TransportTarget]net.Conn

	ipToTarget map[string]abstraction.TransportTarget
	idToTarget map[abstraction.PacketId]abstraction.TransportTarget

	api abstraction.TransportAPI

	logger zerolog.Logger

	errChan chan error
}

// HandleSniffer starts listening for packets on the provided sniffer and handles them.
//
// This function will block until the sniffer is closed
func (transport *Transport) HandleSniffer(sniffer *sniffer.Sniffer) {
	demux, errChan := session.NewSnifferDemux(transport.handleConversation, transport.logger)
	go demux.ReadPackets(sniffer)
	for err := range errChan {
		transport.errChan <- err
	}
}

// HandleUDPServer starts listening for packets on the provided UDP server and handles them.
//
// This function will block until the server is closed
func (transport *Transport) HandleUDPServer(server *udp.Server) {
	packetsCh := server.GetPackets()
	errorsCh := server.GetErrors()

	for {
		select {
		case packet := <-packetsCh:
			transport.handleUDPPacket(packet)
		case err := <-errorsCh:
			transport.errChan <- err
		}
	}
}

// handleUDPPacket handles a single UDP packet received by the UDP server
func (transport *Transport) handleUDPPacket(udpPacket udp.Packet) {
	srcAddr := fmt.Sprintf("%s:%d", udpPacket.SourceIP, udpPacket.SourcePort)
	dstAddr := fmt.Sprintf("%s:%d", udpPacket.DestIP, udpPacket.DestPort)

	// Create a reader from the payload
	reader := bytes.NewReader(udpPacket.Payload)

	// Decode the packet
	packet, err := transport.decoder.DecodeNext(reader)
	if err != nil {
		transport.logger.Error().
			Str("from", srcAddr).
			Str("to", dstAddr).
			Err(err).
			Msg("failed to decode UDP packet")
		transport.errChan <- err
		return
	}

	pre := NewPacketNotification(packet, srcAddr, dstAddr, udpPacket.Timestamp)

	fmt.Printf("XOCOLATEEEEEEEE")

	// Send notification
	transport.api.Notification(pre)
}

// handleConversation is called when the sniffer detects a new conversation and handles its specific packets
func (transport *Transport) handleConversation(socket network.Socket, reader io.Reader) {
	srcAddr := fmt.Sprintf("%s:%d", socket.SrcIP, socket.SrcPort)
	dstAddr := fmt.Sprintf("%s:%d", socket.DstIP, socket.DstPort)
	conversationLogger := transport.logger.With().Str("from", srcAddr).Str("to", dstAddr).Logger()
	go func() {
		for {
			packet, err := transport.decoder.DecodeNext(reader)
			if err != nil {
				conversationLogger.Error().Stack().Err(err).Msg("decode")
				transport.errChan <- err
				return
			}

			transport.api.Notification(NewPacketNotification(packet, srcAddr, dstAddr, time.Now()))
		}
	}()
}

// SetAPI sets the API that the Transport will use
func (transport *Transport) SetAPI(api abstraction.TransportAPI) {
	transport.logger.Trace().Type("api", api).Msg("set api")
	transport.api = api
}

func (transport *Transport) consumeErrors() {
	for err := range transport.errChan {
		transport.api.Notification(NewErrorNotification(err))
	}
}
