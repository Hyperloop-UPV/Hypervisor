// Keep telemetry measurement ids and board ids in one place so parsing, units, and builders stay in sync.
export const TELEMETRY_BOARD = {
  hvscu: 1,
  lcu: 4,
} as const

export const LCU_AIRGAP_KEYS = [
  "lcu_airgap_1",
  "lcu_airgap_2",
  "lcu_airgap_3",
  "lcu_airgap_4",
  "lcu_airgap_5",
  "lcu_airgap_6",
  "lcu_airgap_7",
  "lcu_airgap_8",
] as const

export const LCU_COIL_CURRENT_KEYS = [
  "lcu_coil_current_1",
  "lcu_coil_current_2",
  "lcu_coil_current_3",
  "lcu_coil_current_4",
  "lcu_coil_current_5",
  "lcu_coil_current_6",
  "lcu_coil_current_7",
  "lcu_coil_current_8",
  "lcu_coil_current_9",
  "lcu_coil_current_10",
] as const

export const BATTERY_PACK_COUNT = 18
export const BATTERY_CELLS_PER_PACK = 6

export const SIGNAL_UNITS = {
  levitationDistance: {
    measurementId: "lcu_airgap_1",
    boardId: TELEMETRY_BOARD.lcu,
    fallback: "mm",
  },
  levitationCurrent: {
    measurementId: "lcu_coil_current_1",
    boardId: TELEMETRY_BOARD.lcu,
    fallback: "A",
  },
  dcBusVoltage: {
    measurementId: "voltage_reading",
    boardId: TELEMETRY_BOARD.hvscu,
    fallback: "V",
  },
  totalBatteryVoltage: {
    measurementId: "batteries_voltage_reading",
    boardId: TELEMETRY_BOARD.hvscu,
    fallback: "V",
  },
  packVoltage: {
    measurementId: "battery1_total_voltage",
    boardId: TELEMETRY_BOARD.hvscu,
    fallback: "V",
  },
} as const
