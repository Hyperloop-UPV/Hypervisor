package main

import (
	"flag"
	_ "net/http/pprof"
	"os"
	"os/signal"

	adj_module "github.com/HyperloopUPV-H8/h9-backend/internal/adj"
	"github.com/HyperloopUPV-H8/h9-backend/internal/config"
	"github.com/HyperloopUPV-H8/h9-backend/internal/pod_data"
	"github.com/HyperloopUPV-H8/h9-backend/internal/update_factory"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/abstraction"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/transport"
	trace "github.com/rs/zerolog/log"
)

const (
	BACKEND = "backend"
	UDP     = "UDP"
)

var configFile = flag.String("config", "config.toml", "path to configuration file")
var traceLevel = flag.String("trace", "info", "set the trace level (\"fatal\", \"error\", \"warn\", \"info\", \"debug\", \"trace\")")
var traceFile = flag.String("log", "", "set the trace log file")
var cpuprofile = flag.String("cpuprofile", "", "write cpu profile to file")

var blockprofile = flag.Int("blockprofile", 0, "number of block profiles to include")
var versionFlag = flag.Bool("version", false, "Show the backend version")

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

	// <--- update factory --->
	updateFactory := update_factory.NewFactory()

	// <--- logger --->
	loggerHandler, _ := setUpLogger(config)

	// <--- transport --->
	transp := transport.NewTransport(trace.Logger)

	// <--- vehicle --->
	err = configureVehicle(
		loggerHandler,
		updateFactory,
		transp,
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

	// <--- http server --->
	configureHttpServer(
		podData,
		config,
	)

	// Start loggers
	loggerHandler.Start()

	// Wait for interrupt signal to gracefully shutdown the backend
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)
	defer signal.Stop(interrupt)

	<-interrupt
	trace.Info().Msg("shutting down backend")
}
