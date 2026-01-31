package main

import (
	"context"
	"encoding/json"
	"flag"
	"math/rand"
	"net/http"
	_ "net/http/pprof"
	"os"
	"os/signal"
	"time"

	adj_module "github.com/HyperloopUPV-H8/h9-backend/internal/adj"
	"github.com/HyperloopUPV-H8/h9-backend/internal/config"
	"github.com/HyperloopUPV-H8/h9-backend/internal/pod_data"
	"github.com/HyperloopUPV-H8/h9-backend/internal/update_factory"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/abstraction"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/sse"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/transport"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/worker"
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
var networkDevice = flag.Int("dev", -1, "index of the network device to use, overrides device prompt")
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

	// Start loggers
	loggerHandler.Start()

	// Test SSE

	hub := sse.NewHub(trace.Logger)
	http.Handle("/stream", hub)

	type State struct {
		Status    string  `json:"status"`
		Progress  float64 `json:"progress"`
		Voltage   float64 `json:"voltage"`
		Current   float64 `json:"current"`
		Timestamp int64   `json:"timestamp"`
	}

	randomState := func() State {
		return State{
			Status:    "running",
			Progress:  rand.Float64() * 100,  // 0–100 %
			Voltage:   10 + rand.Float64()*5, // 10–15 V
			Current:   rand.Float64() * 3,    // 0–3 A
			Timestamp: time.Now().UnixMilli(),
		}
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	w := worker.New(500*time.Millisecond, func(ctx context.Context) {
		state := randomState()
		data, _ := json.Marshal(state)
		hub.Broadcast("telemetry", data)
	})

	w.Start(ctx)

	// <--- http server --->
	configureHttpServer(
		podData,
		hub,
		config,
	)

	// Wait for interrupt signal to gracefully shutdown the backend
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)
	defer signal.Stop(interrupt)

	<-interrupt
	trace.Info().Msg("shutting down backend")
}
