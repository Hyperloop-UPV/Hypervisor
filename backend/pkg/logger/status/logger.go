package status

import (
	"fmt"
	"os"
	"path"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/Hyperloop-UPV/Hypervisor/pkg/abstraction"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/logger"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/logger/file"
)

const (
	Name abstraction.LoggerName = "status"
)

type Logger struct {
	// An atomic boolean is used in order to use CompareAndSwap in the Start and Stop methods
	running *atomic.Bool
	writer  *file.CSV
}

type Record struct {
	IP             string
	UA             string
	ConnectionType string
	Timestamp      time.Time
}

func (*Record) Name() abstraction.LoggerName {
	return Name
}

func NewLogger() *Logger {
	return &Logger{
		running: &atomic.Bool{},
		writer:  nil,
	}
}

func (sublogger *Logger) Start() error {
	if !sublogger.running.CompareAndSwap(false, true) {
		fmt.Println("Logger already running")
		return nil
	}

	fileRaw, err := sublogger.createFile()
	if err != nil {
		return err
	}
	sublogger.writer = file.NewCSV(fileRaw)

	fmt.Println("Logger started")
	return nil
}

func (sublogger *Logger) createFile() (*os.File, error) {

	filename := path.Join(
		"logger",
		logger.Timestamp.Format(logger.TimestampFormat),
		"status",
		"status.csv",
	)

	// Mask to give permissions to the created file to everyone (including the parent directories)
	oldMask := syscall.Umask(0)
	defer syscall.Umask(oldMask)

	err := os.MkdirAll(path.Dir(filename), 0777)
	if err != nil {
		return nil, logger.ErrCreatingAllDir{
			Name:      Name,
			Timestamp: time.Now(),
			Path:      filename,
		}
	}

	return os.Create(filename)
}

func (sublogger *Logger) PushRecord(record abstraction.LoggerRecord) error {
	if !sublogger.running.Load() {
		return logger.ErrLoggerNotRunning{
			Name:      Name,
			Timestamp: time.Now(),
		}
	}

	statusRecord, ok := record.(*Record)
	if !ok {
		return logger.ErrWrongRecordType{
			Name:      Name,
			Timestamp: time.Now(),
			Expected:  &Record{},
			Received:  record,
		}
	}

	err := sublogger.writer.Write([]string{

		statusRecord.IP,
		statusRecord.UA,
		statusRecord.ConnectionType,
		statusRecord.Timestamp.Format(time.RFC3339),
	})
	sublogger.writer.Flush()
	if err != nil {
		return logger.ErrWritingFile{
			Name:      Name,
			Timestamp: time.Now(),
			Inner:     err,
		}
	}

	return nil
}

func (sublogger *Logger) PullRecord(abstraction.LoggerRequest) (abstraction.LoggerRecord, error) {
	panic("TODO!")
}

func (sublogger *Logger) Stop() error {
	if !sublogger.running.CompareAndSwap(true, false) {
		fmt.Println("Logger already stopped")
		return nil
	}

	err := sublogger.writer.Close()
	if err != nil {
		return logger.ErrClosingFile{
			Name:      Name,
			Timestamp: time.Now(),
		}
	}

	fmt.Println("Logger stopped")
	return nil
}
