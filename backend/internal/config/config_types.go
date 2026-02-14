package config

import (
	"github.com/Hyperloop-UPV/Hypervisor/pkg/logger"
)

type App struct {
	Addr             string `toml:"addr"`
	StaticPath       string `toml:"static_path"`
	HypervisorAddr   string `toml:"hypervisor_addr"`
	PeriodicInterval int    `toml:"periodic_interval"`
}

type Adj struct {
	Branch string `toml:"branch"`
}

type Network struct {
	DevMode bool `toml:"dev_mode"`
}

type Logging struct {
	TimeUnit    logger.TimeUnit `toml:"time_unit"`
	LoggingPath string          `toml:"logging_path"`
}

type Config struct {
	App     App
	Adj     Adj
	Network Network
	Logging Logging
}
