package main

import (
	"fmt"
	"os"
	"runtime"
	"runtime/pprof"
	"strings"

	"github.com/HyperloopUPV-H8/h9-backend/internal/config"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/logger"
	data_logger "github.com/HyperloopUPV-H8/h9-backend/pkg/logger/data"
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
		data_logger.Name: data_logger.NewLogger(),
	}

	logger.ConfigureLogger(config.Logging.TimeUnit, config.Logging.LoggingPath)
	loggerHandler := logger.NewLogger(subloggers, trace.Logger)

	return loggerHandler, subloggers

}
