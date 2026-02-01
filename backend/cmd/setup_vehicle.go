package main

import (
	"fmt"
	"net/http"
	"os"

	h "github.comHyperloop-UPV/Hypervisor/pkg/http"
	"github.comHyperloop-UPV/Hypervisor/pkg/sse"
	"github.comHyperloop-UPV/Hypervisor/pkg/store"

	trace "github.com/rs/zerolog/log"
	adj_module "github.comHyperloop-UPV/Hypervisor/internal/adj"
	"github.comHyperloop-UPV/Hypervisor/internal/config"
	"github.comHyperloop-UPV/Hypervisor/internal/pod_data"
	"github.comHyperloop-UPV/Hypervisor/pkg/logger"
	"github.comHyperloop-UPV/Hypervisor/pkg/transport"
	vehicle_module "github.comHyperloop-UPV/Hypervisor/pkg/vehicle"
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
