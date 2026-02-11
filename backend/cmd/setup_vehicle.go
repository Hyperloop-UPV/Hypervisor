package main

import (
	"log"

	h "github.com/Hyperloop-UPV/Hypervisor/pkg/http"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/sse"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/store"

	adj_module "github.com/Hyperloop-UPV/Hypervisor/internal/adj"
	"github.com/Hyperloop-UPV/Hypervisor/internal/config"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/logger"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/transport"
	vehicle_module "github.com/Hyperloop-UPV/Hypervisor/pkg/vehicle"
	trace "github.com/rs/zerolog/log"
)

func configureVehicle(

	loggerHandler *logger.Logger,
	transp *transport.Transport,
	storage *store.Store,
	adj adj_module.ADJ,
	config config.Config,

) error {

	vehicle := vehicle_module.New(trace.Logger)
	vehicle.SetLogger(loggerHandler)
	vehicle.SetTransport(transp)
	vehicle.SetStorage(storage)

	return nil

}

func configureHttpServer(
	hub *sse.Hub,
	config config.Config,
) {

	mux := h.NewMux(
		h.Endpoint("/backend/stream", hub),
		h.Endpoint("/", h.HandleStatic(config.App.StaticPath)),
	)

	httpServer := h.NewServer(config.App.Addr, mux)

	log.Fatal(httpServer.ListenAndServe())
}
