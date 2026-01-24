package config

import (
	"github.com/HyperloopUPV-H8/h9-backend/internal/server"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/logger"
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
	Logging Logging
}
