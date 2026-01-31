

type AutogenerateID int32
type ValueUpdate string

// Each update contains a map of measurement updates
type MesurementUpdates map[AutogenerateID]ValueUpdate

// Base information for each measurement
type MeasurementBase struct {
	measuramentID string
	boardIP       string
	displayUnits  string
}

// Base map of measurements
type MesauramentsBase map[AutogenerateID]MeasurementBase

// Hipervisor monitor
type HipervisorMonitor struct {
	boardID string ``
}