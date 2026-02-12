package store

import (
	"encoding/json"
	"os"
	"strconv"

	adj_module "github.com/Hyperloop-UPV/Hypervisor/internal/adj"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/abstraction"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/transport/packet/data"
	"github.com/rs/zerolog"
)

// NewStore creates and initializes a new Store instance given a trace, adj, packetIDToBoard mapping, and monitoring file.
func NewStore(logger zerolog.Logger, adj adj_module.ADJ, packetIDToBoard map[abstraction.PacketId]string, monitoringFile string) *Store {

	// Create store instance
	store := &Store{
		trace:  logger.With().Str("component", "store").Logger(),
		nextID: 1, // Start autogenerate ID from 1
	}

	// Generate equivalences and initialize measurement base
	store.generateEquivalences(monitoringFile)

	// Initialize measurement base
	store.initializeMeasurementBase(adj, packetIDToBoard)

	// Create empty updates

	store.updates = make(MeasurementUpdates)

	return store

}

// GetNextAutogenerateID returns the next available AutogenerateID and increments the internal counter.
func (s *Store) GetNextAutogenerateID() AutogenerateID {
	id := s.nextID
	s.nextID++
	return id
}

// GetMeasurementBase returns the measurement base map. as a JSON
func (s *Store) GetMeasurementBase() []byte {
	data, err := json.Marshal(s.measuramentBase)
	if err != nil {
		s.trace.Error().Err(err).Msg("error marshaling measurement base")
		return []byte{}
	}
	return data
}

// generateEquivalences generates measurement ID equivalences from the hypervisor monitoring configuration file.
func (s *Store) generateEquivalences(monitoringFile string) {

	equivalencesMeasurementID := make(BoardIDEquivalences)

	// load data from Hypervisor monitoring file
	monitoring := s.loadHypervisorMonitoring(monitoringFile)

	// generate equivalences by assigning autogenerate ids to each measurement

	// For each board in the monitoring configuration
	for boardID, packets := range monitoring {

		// if the board does not exist in equivalences map, create it
		if _, exists := equivalencesMeasurementID[boardID]; !exists {
			equivalencesMeasurementID[boardID] = make(map[PacketIDString]map[data.ValueName]AutogenerateID)
		}

		// For each packet in the board
		for packetID, measurements := range packets {

			// if the packet does not exist in equivalences map, create it
			if _, exists := equivalencesMeasurementID[boardID][packetID]; !exists {
				equivalencesMeasurementID[boardID][packetID] = make(map[data.ValueName]AutogenerateID)
			}

			// For each measurement in the packet, assign a new autogenerate id
			for _, measurement := range measurements {
				// it is assumed that there are no duplicate measurements in the monitoring configuration and if there are, they will be unifyed
				// assign new autogenerate id
				equivalencesMeasurementID[boardID][packetID][measurement] = s.GetNextAutogenerateID()
			}
		}
	}

	// generate packetIDToAutogenerateID equivalences
	packetIDEquivalences := make(PacketIDEquivalences)
	for _, packets := range equivalencesMeasurementID {
		for packetID, measurements := range packets {
			packetIDEquivalences[packetID] = make(map[data.ValueName]AutogenerateID)
			for measurementID, autogenerateID := range measurements {
				packetIDEquivalences[packetID][measurementID] = autogenerateID
			}
		}
	}

	// assign to store
	s.boardsIDEquivalences = equivalencesMeasurementID
	s.packetIDEquivalences = packetIDEquivalences

}

// loadHypervisorMonitoring loads hypervisor monitoring configuration from a JSON file.
func (s *Store) loadHypervisorMonitoring(file string) HypervisorMonitoring {

	// unmarshal hypervisor monitoring file
	data, err := os.ReadFile(file)
	if err != nil {
		s.trace.Fatal().Err(err).Msgf("error opening hypervisor monitoring file: %s", file)
	}

	var monitoring HypervisorMonitoring

	// Parse JSON file
	if err := json.Unmarshal(data, &monitoring); err != nil {
		s.trace.Fatal().Err(err).Msgf("error unmarshaling hypervisor monitoring file: %s", file)
	}

	return monitoring
}

// initializeMeasurementBase initializes the measurement base with information from the ADJ module assigning autogenerate IDs to each measurement measurementIDEquivalences must be initialized before calling this function.
func (s *Store) initializeMeasurementBase(adj adj_module.ADJ, packetIDToBoard map[abstraction.PacketId]string) {

	// Initialize measurement base
	measuramentBase := make(MeasurementBases)

	// For each board in the equivalences
	for boardID, packets := range s.boardsIDEquivalences {

		boardIDInt, err := strconv.Atoi(string(boardID))
		if err != nil {
			s.trace.Error().Err(err).Msgf("error converting boardID to int: %s", boardID)
			continue
		}

		// For each packet in the board
		for packetID, measurements := range packets {

			// For each measurement in the packet
			for measurementID, autogenerateID := range measurements {

				// Convert packetID from string to int
				packetIDInt, err := strconv.Atoi(string(packetID))
				if err != nil {
					s.trace.Error().Err(err).Msgf("error converting packetID to int: %s", packetID)
					continue
				}

				// Adj measurement data
				adjMeasurementBase := adj.Boards[packetIDToBoard[abstraction.PacketId(packetIDInt)]].LookUpMeasurements[string(measurementID)]

				// Create MeasurementBase entry
				measurament := MeasurementBase{
					MeasuramentID: string(measurementID),
					BoardID:       uint16(boardIDInt),
					DisplayUnits:  adjMeasurementBase.DisplayUnits,
					Type:          adjMeasurementBase.Type,
					Value:         "-1",
				}

				// If the measurement is of enum type, add enum values

				if adjMeasurementBase.Type == "enum" {
					measurament.EnumValues = adjMeasurementBase.EnumValues
				}

				// Assign to measurement base using autogenerateID as key
				measuramentBase[autogenerateID] = measurament

			}
		}

	}

	// assign to store
	s.measuramentBase = measuramentBase
}
