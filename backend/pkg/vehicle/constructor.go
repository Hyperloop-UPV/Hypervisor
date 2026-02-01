package vehicle

import (
	"github.com/Hyperloop-UPV/Hypervisor/pkg/abstraction"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/store"

	"github.com/rs/zerolog"
)

// New creates a new Vehicle with no modules registered on it
func New(baseLogger zerolog.Logger) Vehicle {
	logger := baseLogger.Sample(zerolog.LevelSampler{
		TraceSampler: zerolog.RandomSampler(50000),
		DebugSampler: zerolog.RandomSampler(1),
		InfoSampler:  zerolog.RandomSampler(1),
		WarnSampler:  zerolog.RandomSampler(1),
		ErrorSampler: zerolog.RandomSampler(1),
	})
	return Vehicle{
		trace: logger,
	}
}

// SetTransport sets the Vehicle Transport to the provided one
func (vehicle *Vehicle) SetTransport(transport abstraction.Transport) {
	transport.SetAPI(vehicle)
	vehicle.transport = transport
	vehicle.trace.Info().Type("transport", transport).Msg("set transport")
}

// SetLogger sets the Vehicle Logger to the provided one
func (vehicle *Vehicle) SetLogger(logger abstraction.Logger) {
	vehicle.logger = logger
	vehicle.trace.Info().Type("logger", logger).Msg("set logger")
}

func (vehicle *Vehicle) SetStorage(storage *store.Store) {

	vehicle.storage = storage
	vehicle.trace.Info().Type("storage", storage).Msg("set store")
}
