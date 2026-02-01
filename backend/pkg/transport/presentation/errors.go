package presentation

import (
	"fmt"

	"github.comHyperloop-UPV/Hypervisor/pkg/abstraction"
)

// ErrUnexpectedId is returned when an ID is not recognized or is not defined
type ErrUnexpectedId struct {
	Id abstraction.PacketId
}

func (err ErrUnexpectedId) Error() string {
	return fmt.Sprintf("unexpected id %d", err.Id)
}
