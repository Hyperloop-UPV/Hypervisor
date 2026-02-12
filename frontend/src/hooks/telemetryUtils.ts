import type { TelemetryData } from "@/types/telemetry"
import { buildBatteryData, buildLevitation } from "@/lib/telemetryBuilders"

export const BOARD_LCU = 4
export const BOARD_HVSCU = 1

export type MeasurementDictionaryEntry = {
  measurement_id: string
  board_id: number
  display_units?: string | null
  value?: string | null
}

export type MeasurementDictionary = Record<string, MeasurementDictionaryEntry>
export type MeasurementUpdate = Record<string, string | null | undefined>

type UnitsByMeasurementKey = Record<string, string | null | undefined>

type UnknownRecord = Record<string, unknown>

const measurementKey = (measurementId: string, boardId: number) =>
  `${boardId}:${measurementId}`

const isRecord = (payload: unknown): payload is UnknownRecord =>
  typeof payload === "object" && payload !== null && !Array.isArray(payload)

export const isMeasurementDictionary = (
  payload: unknown,
): payload is MeasurementDictionary => {
  if (!isRecord(payload)) return false
  return Object.values(payload).every((value) => {
    if (!isRecord(value)) return false
    return typeof value.measurement_id === "string" && typeof value.board_id === "number"
  })
}

export const isMeasurementUpdate = (payload: unknown): payload is MeasurementUpdate => {
  if (!isRecord(payload)) return false
  return Object.values(payload).every(
    (value) => value === null || value === undefined || typeof value === "string",
  )
}

const parseTelemetryValue = (value: string | null | undefined) => {
  if (value === null || value === undefined) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeTelemetryValue = (value: string | null | undefined) => {
  const parsed = parseTelemetryValue(value)
  if (parsed === null) return null
  return parsed === -1 ? null : parsed
}

export const hasMeasurementValues = (dictionary: MeasurementDictionary) =>
  Object.values(dictionary).some(
    (entry) => normalizeTelemetryValue(entry?.value) !== null,
  )

const buildValueMap = (dictionary: MeasurementDictionary) => {
  const values = new Map<string, number | null>()
  const units: UnitsByMeasurementKey = {}

  Object.values(dictionary).forEach((entry) => {
    if (typeof entry?.measurement_id !== "string" || typeof entry?.board_id !== "number") return
    const key = measurementKey(entry.measurement_id, entry.board_id)
    values.set(key, normalizeTelemetryValue(entry.value))
    if (entry.display_units !== undefined) {
      units[key] = entry.display_units
    }
  })

  return { values, units }
}

const buildTelemetryData = (dictionary: MeasurementDictionary): TelemetryData => {
  const { values, units } = buildValueMap(dictionary)
  const getValue = (measurementId: string, boardId: number) =>
    values.get(measurementKey(measurementId, boardId)) ?? null

  return {
    ...buildLevitation(getValue),
    ...buildBatteryData(getValue),
    unitsByMeasurementKey: units,
  }
}

export const buildTelemetryFromInitialDictionary = (
  dictionary: MeasurementDictionary,
): TelemetryData => buildTelemetryData(dictionary)

export const applyUpdateAndBuildTelemetry = (
  dictionary: MeasurementDictionary,
  updates: MeasurementUpdate,
): TelemetryData => {
  applyMeasurementUpdate(dictionary, updates)
  return buildTelemetryData(dictionary)
}

export const getTelemetrySignals = (data: TelemetryData | null) => {
  const levitationDistance = data?.levitation?.verticalGap ?? null
  const levitationCurrent = data?.levitation?.current ?? null
  const levitationPower = data?.levitation?.power ?? null

  const dcBusVoltage = data?.dcBusVoltage ?? null
  const totalBatteryVoltage = data?.totalBatteryVoltage ?? null
  const unitsByMeasurementKey = data?.unitsByMeasurementKey ?? {}

  const unitFor = (measurementId: string, boardId: number, fallback: string) =>
    unitsByMeasurementKey[measurementKey(measurementId, boardId)] ?? fallback

  return {
    levitationDistance,
    levitationCurrent,
    levitationPower,
    dcBusVoltage,
    totalBatteryVoltage,
    levitationDistanceUnit: unitFor("lcu_airgap_1", BOARD_LCU, "mm"),
    levitationCurrentUnit: unitFor("lcu_coil_current_1", BOARD_LCU, "A"),
    dcBusVoltageUnit: unitFor("voltage_reading", BOARD_HVSCU, "V"),
    totalBatteryVoltageUnit: unitFor("batteries_voltage_reading", BOARD_HVSCU, "V"),
    packVoltageUnit: unitFor("battery1_total_voltage", BOARD_HVSCU, "V"),
  }
}

const applyMeasurementUpdate = (
  dictionary: MeasurementDictionary,
  updates: MeasurementUpdate,
) => {
  Object.entries(updates).forEach(([key, value]) => {
    const entry = dictionary[key]
    if (!entry) return
    entry.value = value ?? null
  })
}
