import type { TelemetryData } from "@/types/telemetry"
import {
  BATTERY_CELLS_PER_PACK,
  BATTERY_PACK_COUNT,
  LCU_AIRGAP_KEYS,
  LCU_COIL_CURRENT_KEYS,
  TELEMETRY_BOARD,
} from "@/lib/telemetrySchema"

const mean = (values: Array<number | null | undefined>) => {
  const clean = values.filter((value) => typeof value === "number") as number[]
  if (clean.length === 0) return null
  return clean.reduce((sum, value) => sum + value, 0) / clean.length
}

export const buildLevitation = (getValue: (measurementId: string, boardId: number) => number | null) => {
  // Levitation sensors come in arrays; the dashboard displays one stable value,
  // so we use the mean of available sensors.
  const levitationDistance = mean(
    LCU_AIRGAP_KEYS.map((key) => getValue(key, TELEMETRY_BOARD.lcu)),
  )
  const levitationCurrent = mean(
    LCU_COIL_CURRENT_KEYS.map((key) => getValue(key, TELEMETRY_BOARD.lcu)),
  )

  const voltageReading = getValue("voltage_reading", TELEMETRY_BOARD.hvscu)
  const currentReading = getValue("current_reading", TELEMETRY_BOARD.hvscu)
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

export const buildBatteryData = (getValue: (measurementId: string, boardId: number) => number | null) => {
  const hvbms: TelemetryData["hvbms"] = []

  for (let packId = 1; packId <= BATTERY_PACK_COUNT; packId += 1) {
    const prefix = `battery${packId}_`
    const cells = Array.from({ length: BATTERY_CELLS_PER_PACK }, (_, index) => {
      const cellId = index + 1
      return {
        id: cellId,
        voltage: getValue(`${prefix}cell${cellId}`, TELEMETRY_BOARD.hvscu),
        temp: null,
      }
    })
    const hasCellData = cells.some((cell) => typeof cell.voltage === "number")
    const packVoltage = getValue(`${prefix}total_voltage`, TELEMETRY_BOARD.hvscu)
    // Skip fully-empty packs so cards appear only when useful telemetry exists.
    if (!hasCellData && typeof packVoltage !== "number") continue
    hvbms.push({
      id: packId,
      voltage: packVoltage,
      cells,
    })
  }

  return {
    hvbms,
    totalBatteryVoltage: getValue("batteries_voltage_reading", TELEMETRY_BOARD.hvscu),
  }
}
