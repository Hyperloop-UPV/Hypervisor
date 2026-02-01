package vehicle

import (
	"fmt"

	"github.comHyperloop-UPV/Hypervisor/pkg/abstraction"
)

type ErrUnexpectedNotification struct {
	Notification abstraction.TransportNotification
}

func (err ErrUnexpectedNotification) Error() string {
	return fmt.Sprintf("Unexpected notification type: %T", err.Notification)
}
