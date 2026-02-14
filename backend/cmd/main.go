package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	_ "net/http/pprof"
	"os"
	"os/signal"

	adj_module "github.com/Hyperloop-UPV/Hypervisor/internal/adj"
	"github.com/Hyperloop-UPV/Hypervisor/internal/config"
	"github.com/Hyperloop-UPV/Hypervisor/internal/pod_data"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/abstraction"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/sse"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/store"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/transport"
	trace "github.com/rs/zerolog/log"
)

const (
	BACKEND = "backend"
	UDP     = "UDP"
)

var configFile = flag.String("config", "config.toml", "path to configuration file")
var monitoringFile = flag.String("monitoring", "hypervisor-monitoring.json", "file where monitoring data is stored")
var traceLevel = flag.String("trace", "info", "set the trace level (\"fatal\", \"error\", \"warn\", \"info\", \"debug\", \"trace\")")
var traceFile = flag.String("log", "", "set the trace log file")
var cpuprofile = flag.String("cpuprofile", "", "write cpu profile to file")
var networkDevice = flag.Int("dev", -1, "index of the network device to use, overrides device prompt")
var blockprofile = flag.Int("blockprofile", 0, "number of block profiles to include")
var versionFlag = flag.Bool("version", false, "Show the backend version")
var loggerFlag = flag.Bool("L", false, "enable boards logging")

type SubloggersMap map[abstraction.LoggerName]abstraction.Logger

func main() {
	// Parse command line flags
	flag.Parse()
	handleVersionFlag()

	// Configure trace
	traceFile := initTrace(*traceLevel, *traceFile)
	if traceFile != nil {
		defer traceFile.Close()
	}

	// Set use to all available CPUs and setup CPU profiling if enabled
	cleanup := setupRuntimeCPU()
	defer cleanup()

	// <--- config --->
	config, err := config.GetConfig(*configFile)
	if err != nil {
		trace.Fatal().Err(err).Msg("error unmarshaling toml file")
	}

	// <--- ADJ --->
	adj, err := adj_module.NewADJ(config.Adj.Branch)
	if err != nil {
		trace.Fatal().Err(err).Msg("setting up ADJ")
	}

	// <--- pod data --->
	podData, err := pod_data.NewPodData(adj.Boards, adj.Info.Units)
	if err != nil {
		trace.Fatal().Err(err).Msg("creating podData")
	}
	// <--- logger --->
	loggerHandler, _ := setUpLogger(config)

	// <--- transport --->
	transp := transport.NewTransport(trace.Logger)

	// <--- store --->
	storage := store.NewStore(
		trace.Logger,
		adj,
		createPacketIDToBoard(podData),
		*monitoringFile,
	)

	// <--- SSE Hub --->
	hub := sse.NewHub(
		trace.Logger,
		storage.GetMeasurementBase(),
		loggerHandler,
	)
	http.Handle("/stream", hub)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// <--- vehicle --->
	err = configureVehicle(
		loggerHandler,
		transp,
		storage,
		adj,
		config,
	)
	if err != nil {
		trace.Err(err).Msg("configuring vehicle")
	}

	// <--- transport --->
	configureTransport(
		adj,
		podData,
		transp,
		config,
	)

	// <-- Worker -->

	setUpHypervisorWorker(
		ctx,
		storage,
		hub,
		config,
	)

	// <--- http server --->
	srv := configureHttpServer(
		hub,
		config,
	)
	// start server

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Start board logger if required

	loggerHandler.Start()

	// Wait for interrupt signal to gracefully shutdown the backend
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)
	defer signal.Stop(interrupt)

	<-interrupt
	ctx.Done()
	trace.Info().Msg("shutting down backend")
}
