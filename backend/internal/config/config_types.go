package config

import (
	"github.comHyperloop-UPV/Hypervisor/internal/server"
	"github.comHyperloop-UPV/Hypervisor/pkg/logger"
)

type App struct {
	AutomaticWindowOpening string `toml:"automatic_window_opening"`
}

type Adj struct {
	Branch string `toml:"branch"`
}

type Logging struct {
	TimeUnit    logger.TimeUnit `toml:"time_unit"`
	LoggingPath string          `toml:"logging_path"`
}

type Config struct {
	App     App
	Server  server.Config
	Adj     Adj
	Network Network
	Logging Logging
}

type Network struct {
	DevMode bool `toml:"dev_mode"`
}
