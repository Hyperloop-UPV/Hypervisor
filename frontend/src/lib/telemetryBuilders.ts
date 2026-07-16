import type { TelemetryData } from "@/types/telemetry"
import {
  BATTERY_CELLS_PER_PACK,
  BATTERY_PACK_COUNT,
  BATTERY_TEMPS_PER_PACK,
  LCU_AIRGAP_KEYS,
  LCU_COIL_CURRENT_KEYS,
  TELEMETRY_BOARD,
} from "@/lib/telemetrySchema"

type GetValue = (measurementId: string, boardId: number) => number | null
type GetRaw = (measurementId: string, boardId: number) => string | null

const mean = (values: Array<number | null | undefined>) => {
  const clean = values.filter((value) => typeof value === "number") as number[]
  if (clean.length === 0) return null
  return clean.reduce((sum, value) => sum + value, 0) / clean.length
}

// Enums and booleans arrive as raw strings (e.g. "Idle", "true"), not numbers.
export const parseBoolean = (value: string | null): boolean | null => {
  if (value === null) return null
  return value === "true" || value === "1"
}

export const buildLevitation = (getValue: GetValue) => {
  // Levitation sensors come in arrays; the dashboard displays one stable value,
  // so we use the mean of available sensors.
  const levitationDistance = mean(
    LCU_AIRGAP_KEYS.map((key) => getValue(key, TELEMETRY_BOARD.lcu)),
  )
  const levitationCurrent = mean(
    LCU_COIL_CURRENT_KEYS.map((key) => getValue(key, TELEMETRY_BOARD.lcu)),
  )

  const voltageReading = getValue("voltage_reading", TELEMETRY_BOARD.hvbms)
  const currentReading = getValue("current_reading", TELEMETRY_BOARD.hvbms)
  const levitationPower =
    typeof voltageReading === "number" && typeof currentReading === "number"
      ? voltageReading * currentReading
      : null

  return {
    levitation: {
      verticalGap: levitationDistance,
      current: levitationCurrent,
      power: levitationPower,
    },
    dcBusVoltage: voltageReading,
  }
}

export const buildBatteryData = (getValue: GetValue) => {
  const hvbms: TelemetryData["hvbms"] = []

  for (let packId = 1; packId <= BATTERY_PACK_COUNT; packId += 1) {
    const prefix = `battery${packId}_`
    const cells = Array.from({ length: BATTERY_CELLS_PER_PACK }, (_, index) => {
      const cellId = index + 1
      return {
        id: cellId,
        voltage: getValue(`${prefix}cell${cellId}`, TELEMETRY_BOARD.hvbms),
      }
    })
    const temps = Array.from({ length: BATTERY_TEMPS_PER_PACK }, (_, index) =>
      getValue(`${prefix}temp${index + 1}`, TELEMETRY_BOARD.hvbms),
    )
    const hasCellData = cells.some((cell) => typeof cell.voltage === "number")
    const packVoltage = getValue(`${prefix}total_voltage`, TELEMETRY_BOARD.hvbms)
    // Skip fully-empty packs so cards appear only when useful telemetry exists.
    if (!hasCellData && typeof packVoltage !== "number") continue
    hvbms.push({
      id: packId,
      voltage: packVoltage,
      cells,
      temps,
    })
  }

  return {
    hvbms,
    totalBatteryVoltage: getValue("batteries_voltage_reading", TELEMETRY_BOARD.hvbms),
  }
}

export const buildPropulsion = (
  getValue: GetValue,
  getRaw: GetRaw,
): { propulsion: TelemetryData["propulsion"] } => {
  const board = TELEMETRY_BOARD.pcu

  return {
    propulsion: {
      state: getRaw("state", board),
      targetSpeed: getValue("target_speed", board),
      speedError: getValue("speed_error", board),
      actualCurrentRef: getValue("actual_current_ref", board),
      slipMotor: getValue("slip_motor", board),
      speedKmH: getValue("imu_speed_km_h", board),
      positionM: getValue("imu_position_m", board),
      frequency: getValue("frequency", board),
      modulationFrequency: getValue("modulation_frequency", board),
      dutyU: getValue("duty_u", board),
      dutyV: getValue("duty_v", board),
      dutyW: getValue("duty_w", board),
      currentPeak: getValue("current_Peak", board),
      batteryVoltageA: getValue("voltage_battery_a", board),
      batteryVoltageB: getValue("voltage_battery_b", board),
      currentSensors: {
        uA: getValue("current_sensor_u_a", board),
        vA: getValue("current_sensor_v_a", board),
        wA: getValue("current_sensor_w_a", board),
        uB: getValue("current_sensor_u_b", board),
        vB: getValue("current_sensor_v_b", board),
        wB: getValue("current_sensor_w_b", board),
      },
      gateDriver: {
        faultA: parseBoolean(getRaw("gd_fault_a", board)),
        faultB: parseBoolean(getRaw("gd_fault_b", board)),
        readyA: parseBoolean(getRaw("gd_ready_a", board)),
        readyB: parseBoolean(getRaw("gd_ready_b", board)),
      },
    },
  }
}

export const buildVehicleState = (
  getValue: GetValue,
  getRaw: GetRaw,
): { vehicleState: TelemetryData["vehicleState"] } => {
  const board = TELEMETRY_BOARD.vcu

  return {
    vehicleState: {
      state: getRaw("state", board),
      pressures: {
        high: getValue("high_pressure", board),
        low: getValue("low_pressure", board),
        regulatorFeedback: getValue("pressure_regulator_feedback", board),
      },
      brakes: {
        active: parseBoolean(getRaw("active_brakes", board)),
        status: getRaw("brakes_status", board),
      },
      electrovalveEnabled: parseBoolean(getRaw("electrovalve_enabled", board)),
      safety: {
        sdcClosed: parseBoolean(getRaw("sdc_closed", board)),
        hvbmsConnected: parseBoolean(getRaw("hvbms_connected", board)),
        pcuConnected: parseBoolean(getRaw("pcu_connected", board)),
        lcuConnected: parseBoolean(getRaw("lcu_connected", board)),
      },
    },
  }
}
