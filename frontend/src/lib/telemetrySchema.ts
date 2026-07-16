// Keep telemetry measurement ids and board ids in one place so parsing, units, and builders stay in sync.
// Board ids and measurement ids come from the ADJ repo (Astra branch): https://github.com/Hyperloop-UPV/adj
export const TELEMETRY_BOARD = {
  vcu: 3,
  lcu: 4,
  pcu: 5,
  hvbms: 7,
} as const

export const LCU_AIRGAP_KEYS = [
  "airgap_1",
  "airgap_2",
  "airgap_3",
  "airgap_4",
  "airgap_5",
  "airgap_6",
  "airgap_7",
  "airgap_8",
] as const

export const LCU_COIL_CURRENT_KEYS = [
  "coil_current_1",
  "coil_current_2",
  "coil_current_3",
  "coil_current_4",
  "coil_current_5",
  "coil_current_6",
  "coil_current_7",
  "coil_current_8",
  "coil_current_9",
  "coil_current_10",
] as const

// Physical length of the test track the pod runs on.
export const TRACK_LENGTH_M = 48

export const BATTERY_PACK_COUNT = 8
export const BATTERY_CELLS_PER_PACK = 12
export const BATTERY_TEMPS_PER_PACK = 4

export const SIGNAL_UNITS = {
  levitationDistance: {
    measurementId: "airgap_1",
    boardId: TELEMETRY_BOARD.lcu,
    fallback: "mm",
  },
  levitationCurrent: {
    measurementId: "coil_current_1",
    boardId: TELEMETRY_BOARD.lcu,
    fallback: "A",
  },
  dcBusVoltage: {
    measurementId: "voltage_reading",
    boardId: TELEMETRY_BOARD.hvbms,
    fallback: "V",
  },
  totalBatteryVoltage: {
    measurementId: "batteries_voltage_reading",
    boardId: TELEMETRY_BOARD.hvbms,
    fallback: "V",
  },
  packVoltage: {
    measurementId: "battery1_total_voltage",
    boardId: TELEMETRY_BOARD.hvbms,
    fallback: "V",
  },
  propulsionSpeed: {
    measurementId: "imu_speed_km_h",
    boardId: TELEMETRY_BOARD.pcu,
    fallback: "km/h",
  },
  propulsionCurrent: {
    measurementId: "actual_current_ref",
    boardId: TELEMETRY_BOARD.pcu,
    fallback: "A",
  },
  propulsionFrequency: {
    measurementId: "frequency",
    boardId: TELEMETRY_BOARD.pcu,
    fallback: "Hz",
  },
} as const
