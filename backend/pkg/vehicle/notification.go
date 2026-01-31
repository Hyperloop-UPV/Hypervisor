package vehicle

import (
	"errors"
	"fmt"
	"strings"

	"github.com/HyperloopUPV-H8/h9-backend/pkg/abstraction"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/logger"
	data_logger "github.com/HyperloopUPV-H8/h9-backend/pkg/logger/data"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/transport"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/transport/packet/data"
)

// Notification is the method invoked by transport to notify of a new event (e.g.packet received)
func (vehicle *Vehicle) Notification(notification abstraction.TransportNotification) {
	vehicle.trace.Trace().Type("notification", notification).Msg("notification")

	err := error(nil)
	switch concreteNotification := notification.(type) {
	case transport.PacketNotification:
		err = vehicle.handlePacketNotification(concreteNotification)
	case transport.ErrorNotification:
		err = concreteNotification.Err
	default:
		vehicle.trace.Warn().Type("notification", notification).Msg("unexpected notification type")
		err = ErrUnexpectedNotification{Notification: notification}
	}

	if err != nil {
		vehicle.notifyError("Transport Error", err)
	}
}

func (vehicle *Vehicle) handlePacketNotification(notification transport.PacketNotification) error {
	var to string

	switch p := notification.Packet.(type) {
	case *data.Packet:

		var err error

		fmt.Printf("XOCOLATEEEEEEEE")

		// TODO: SEND TO FRONTEND
		// if err != nil {
		// 	vehicle.trace.Error().Stack().Err(err).Msg("broker push")
		// 	return errors.Join(fmt.Errorf("update data to frontend (data with id %d from %s to %s)", p.Id(), notification.From, notification.To), err)
		// }

		from, exists := vehicle.idToBoardName[notification.Packet.Id()]
		if !exists {
			from = notification.From
		}

		to_ip := strings.Split(notification.To, ":")[0]

		if to_ip == "192.168.0.9" || to_ip == "127.0.0.9" {
			to = "backend"
		} else {
			to, exists = vehicle.idToBoardName[notification.Packet.Id()]
			if !exists {
				to = notification.From
			}
		}

		err = vehicle.logger.PushRecord(&data_logger.Record{
			Packet:    p,
			From:      from,
			To:        to,
			Timestamp: notification.Timestamp,
		})

		if err != nil && !errors.Is(err, logger.ErrLoggerNotRunning{}) {
			vehicle.trace.Error().Stack().Err(err).Msg("logger push")
			return errors.Join(fmt.Errorf("log data to disk (data with id %d from %s to %s)", p.Id(), notification.From, notification.To))
		}
	}
	return nil
}
