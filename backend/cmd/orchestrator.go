package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"runtime"
	"runtime/pprof"
	"strings"
	"time"

	"github.com/Hyperloop-UPV/Hypervisor/internal/config"
	"github.com/Hyperloop-UPV/Hypervisor/internal/pod_data"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/abstraction"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/logger"
	data_logger "github.com/Hyperloop-UPV/Hypervisor/pkg/logger/data"
	status_logger "github.com/Hyperloop-UPV/Hypervisor/pkg/logger/status"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/sse"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/store"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/worker"
	trace "github.com/rs/zerolog/log"
)

// Handle version flag
func handleVersionFlag() {

	if *versionFlag {
		versionFile := "VERSION.txt"
		versionData, err := os.ReadFile(versionFile)
		if err == nil {
			fmt.Println("Hyperloop UPV Backend Version:", strings.TrimSpace(string(versionData)))
		} else {
			fmt.Println("Hyperloop UPV Backend Version: unknown")
		}
		os.Exit(0)
	}
}

// createPacketIDToBoard builds a lookup table that maps each PacketId
// to the name of the board that produced it.
func createPacketIDToBoard(
	podData pod_data.PodData,
) map[abstraction.PacketId]string {

	idToBoard := make(map[abstraction.PacketId]string)

	for _, board := range podData.Boards {
		for _, packet := range board.Packets {
			idToBoard[packet.Id] = board.Name
		}
	}

	return idToBoard
}

// setupRuntimeCPU sets up CPU profiling if the cpuprofile flag is set.
// It also sets the maximum number of CPUs to use.
//
// Returns a cleanup function that stops the CPU profiling and closes the file,
// which should be deferred by the caller.
func setupRuntimeCPU() func() {

	cleanup := func() {}

	runtime.GOMAXPROCS(runtime.NumCPU())
	if *cpuprofile != "" {
		f, err := os.Create(*cpuprofile)
		if err != nil {
			f.Close()
			trace.Fatal().Stack().Err(err).Msg("could not set up CPU profiling")

		}
		pprof.StartCPUProfile(f)

		cleanup = func() {
			pprof.StopCPUProfile()
			f.Close()
		}
	}
	runtime.SetBlockProfileRate(*blockprofile)

	return cleanup
}

func setUpLogger(config config.Config) (*logger.Logger, SubloggersMap) {

	var subloggers = SubloggersMap{
		data_logger.Name:   data_logger.NewLogger(),
		status_logger.Name: status_logger.NewLogger(),
	}

	logger.ConfigureLogger(config.Logging.TimeUnit, config.Logging.LoggingPath)
	loggerHandler := logger.NewLogger(subloggers, trace.Logger)

	return loggerHandler, subloggers

}

// Configures Store

func setUpHypervisorWorker(
	ctx context.Context,
	storage *store.Store,
	hub *sse.Hub,
	cfg config.Config,
) {
	w := worker.New(time.Duration(cfg.App.PeriodicInterval)*time.Millisecond, func(ctx context.Context) {

		// Gets the latest data
		state := storage.SnapshotAndReset()

		// Ensures that there is something to send
		if len(state) == 0 {
			return
		}
		data, err := json.Marshal(state)
		if err != nil {
			trace.Error().Err(err).Msg("marshal telemetry")
			return
		}

		// Brodcast to each client
		hub.Broadcast(data)
	})

	w.Start(ctx)
}
