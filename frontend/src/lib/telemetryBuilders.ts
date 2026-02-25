import type { TelemetryData } from "@/types/telemetry"

const lcuAirgapKeys = [
  "lcu_airgap_std"
]

const lcuCoilCurrentKeys = [
  "lcu_coil_current_1",
]

const PACK_COUNT = 18
const CELLS_PER_PACK = 6
const BOARD_LCU = 4
const BOARD_HVSCU = 1

const mean = (values: Array<number | null | undefined>) => {
  const clean = values.filter((value) => typeof value === "number") as number[]
  if (clean.length === 0) return null
  return clean.reduce((sum, value) => sum + value, 0) / clean.length
}

export const buildLevitation = (getValue: (measurementId: string, boardId: number) => number | null) => {
  const levitationDistance = mean(lcuAirgapKeys.map((key) => getValue(key, BOARD_LCU)))
  const levitationCurrent = mean(lcuCoilCurrentKeys.map((key) => getValue(key, BOARD_LCU)))

  const voltageReading = getValue("voltage_reading", BOARD_HVSCU)
  //const currentReading = getValue("current_reading", BOARD_HVSCU)
  const levitationPower = getValue("lcu_power", BOARD_LCU);


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

  for (let packId = 1; packId <= PACK_COUNT; packId += 1) {
    const prefix = `battery${packId}_`
    const cells = Array.from({ length: CELLS_PER_PACK }, (_, index) => {
      const cellId = index + 1
      return {
        id: cellId,
        voltage: getValue(`${prefix}cell${cellId}`, BOARD_HVSCU),
        temp: null,
      }
    })
    const hasCellData = cells.some((cell) => typeof cell.voltage === "number")
    const packVoltage = getValue(`${prefix}total_voltage`, BOARD_HVSCU)
    if (!hasCellData && typeof packVoltage !== "number") continue
    hvbms.push({
      id: packId,
      voltage: packVoltage,
      cells,
    })
  }

  return {
    hvbms,
    totalBatteryVoltage: getValue("batteries_voltage_reading", BOARD_HVSCU),
  }
}
