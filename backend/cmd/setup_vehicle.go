package main

import (
	"fmt"
	"net/http"
	"os"

	h "github.com/Hyperloop-UPV/Hypervisor/pkg/http"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/sse"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/store"

	adj_module "github.com/Hyperloop-UPV/Hypervisor/internal/adj"
	"github.com/Hyperloop-UPV/Hypervisor/internal/config"
	"github.com/Hyperloop-UPV/Hypervisor/internal/pod_data"
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
	podData pod_data.PodData,
	hub *sse.Hub,
	config config.Config) {

	podDataHandle, err := h.HandleDataJSON("podData.json", pod_data.GetDataOnlyPodData(podData))
	if err != nil {
		fmt.Fprintf(os.Stderr, "error creating podData handler: %v\n", err)
	}

	for _, server := range config.Server {
		mux := h.NewMux(
			h.Endpoint("/backend"+server.Endpoints.PodData, podDataHandle),
			h.Endpoint(server.Endpoints.Files, h.HandleStatic(server.StaticPath)),
			h.Endpoint("/backend/stream", hub),
		)

		httpServer := h.NewServer(server.Addr, mux)
		go httpServer.ListenAndServe()
	}

	go http.ListenAndServe("127.0.0.1:4040", nil)
}
