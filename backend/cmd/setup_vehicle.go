package main

import (
	"fmt"
	"net/http"
	"os"

	h "github.com/HyperloopUPV-H8/h9-backend/pkg/http"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/sse"

	adj_module "github.com/HyperloopUPV-H8/h9-backend/internal/adj"
	"github.com/HyperloopUPV-H8/h9-backend/internal/config"
	"github.com/HyperloopUPV-H8/h9-backend/internal/pod_data"
	"github.com/HyperloopUPV-H8/h9-backend/internal/update_factory"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/logger"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/transport"
	vehicle_module "github.com/HyperloopUPV-H8/h9-backend/pkg/vehicle"
	trace "github.com/rs/zerolog/log"
)

func configureVehicle(

	loggerHandler *logger.Logger,
	updateFactory *update_factory.UpdateFactory,
	transp *transport.Transport,
	adj adj_module.ADJ,
	config config.Config,

) error {

	vehicle := vehicle_module.New(trace.Logger)
	vehicle.SetLogger(loggerHandler)
	vehicle.SetUpdateFactory(updateFactory)
	vehicle.SetTransport(transp)

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
