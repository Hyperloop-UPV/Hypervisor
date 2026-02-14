package main

import (
	"net/http"
	"os"
	"path/filepath"

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
) *http.Server {

	mux := h.NewMux(
		h.Endpoint("/backend/stream", hub),
		h.Endpoint("/", HandleSPA(config.App.StaticPath)),
	)

	srv := &http.Server{
		Addr:    config.App.Addr,
		Handler: mux,
	}

	return srv
}

// Configuration to redirect to react router
func HandleSPA(staticPath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		filePath := filepath.Join(staticPath, r.URL.Path)

		// Si el archivo existe → servirlo
		if info, err := os.Stat(filePath); err == nil && !info.IsDir() {
			http.ServeFile(w, r, filePath)
			return
		}

		// Si no → devolver index.html
		http.ServeFile(w, r, filepath.Join(staticPath, "index.html"))
	}
}
