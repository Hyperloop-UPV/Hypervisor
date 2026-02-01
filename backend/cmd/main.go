package main

import (
	"context"
	"flag"
	"net/http"
	_ "net/http/pprof"
	"os"
	"os/signal"

	trace "github.com/rs/zerolog/log"
	adj_module "github.comHyperloop-UPV/Hypervisor/internal/adj"
	"github.comHyperloop-UPV/Hypervisor/internal/config"
	"github.comHyperloop-UPV/Hypervisor/internal/pod_data"
	"github.comHyperloop-UPV/Hypervisor/pkg/abstraction"
	"github.comHyperloop-UPV/Hypervisor/pkg/sse"
	"github.comHyperloop-UPV/Hypervisor/pkg/store"
	"github.comHyperloop-UPV/Hypervisor/pkg/transport"
)

const (
	BACKEND = "backend"
	UDP     = "UDP"
)

var configFile = flag.String("config", "config.toml", "path to configuration file")
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
		"../../hypervisor-monitoring.json",
	)

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
	hub := sse.NewHub(
		trace.Logger,
		storage.GetMeasurementBase(),
	)
	http.Handle("/stream", hub)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	setUpHypervisorWorker(
		ctx,
		storage,
		hub,
	)

	// <--- http server --->
	configureHttpServer(
		podData,
		hub,
		config,
	)

	// Start board logger if required
	if *loggerFlag {

		loggerHandler.Start()
	}

	// Wait for interrupt signal to gracefully shutdown the backend
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)
	defer signal.Stop(interrupt)

	<-interrupt
	trace.Info().Msg("shutting down backend")
}
