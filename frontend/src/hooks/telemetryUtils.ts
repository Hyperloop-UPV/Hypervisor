import { buildBatteryData, buildLevitation } from "@/lib/telemetryBuilders"
import { SIGNAL_UNITS } from "@/lib/telemetrySchema"
import type { TelemetryData } from "@/types/telemetry"

export type MeasurementDictionaryEntry = {
  measurement_id: string
  board_id: number
  display_units?: string | null
  value?: string | null
}

export type MeasurementDictionary = Record<string, MeasurementDictionaryEntry>
export type MeasurementStatus = Record<string, string | null | undefined>

export type MeasurementUpdate = {
  // Backend uptime is elapsed time since the telemetry stream started.
  uptime: number
  status: MeasurementStatus
}

type UnitsByMeasurementKey = Record<string, string | null | undefined>
type UnknownObject = Record<string, unknown>

const measurementKey = (measurementId: string, boardId: number) =>
  `${boardId}:${measurementId}`

const isObject = (payload: unknown): payload is UnknownObject =>
  typeof payload === "object" && payload !== null && !Array.isArray(payload)

const isStatusValue = (value: unknown): value is string | null | undefined =>
  value === null || value === undefined || typeof value === "string"

const isStatusMap = (value: unknown): value is MeasurementStatus => {
  if (!isObject(value)) return false
  return Object.values(value).every(isStatusValue)
}

export const isMeasurementDictionary = (
  payload: unknown,
): payload is MeasurementDictionary => {
  if (!isObject(payload)) return false
  return Object.values(payload).every((value) => {
    if (!isObject(value)) return false
    return (
      typeof value.measurement_id === "string" &&
      typeof value.board_id === "number"
    )
  })
}

// Primary payload shape:
// { uptime: 123, status: { "1": "4.2", ... } }
// We still accept a raw status map for compatibility with older emitters.
export const normalizeMeasurementUpdate = (
  payload: unknown,
): MeasurementUpdate | null => {
  if (!isObject(payload)) return null

  if (isStatusMap(payload)) {
    return { status: payload, uptime: 0 }
  }

  const status = payload.status
  if (!isStatusMap(status)) return null

  return {
    status,
    uptime: typeof payload.uptime === "number" ? payload.uptime : 0,
  }
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

const buildTelemetryLookup = (dictionary: MeasurementDictionary) => {
  const values: Record<string, number | null> = {}
  const units: UnitsByMeasurementKey = {}

  for (const entry of Object.values(dictionary)) {
    if (
      typeof entry?.measurement_id !== "string" ||
      typeof entry?.board_id !== "number"
    )
      continue

    const key = measurementKey(entry.measurement_id, entry.board_id)
    values[key] = normalizeTelemetryValue(entry.value)

    if (entry.display_units !== undefined) {
      units[key] = entry.display_units
    }
  }

  return { values, units }
}

const buildTelemetryData = (dictionary: MeasurementDictionary): TelemetryData => {
  const { values, units } = buildTelemetryLookup(dictionary)
  const getValue = (measurementId: string, boardId: number) =>
    values[measurementKey(measurementId, boardId)] ?? null

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

  const unitFor = (
    measurementId: string,
    boardId: number,
    fallback: string,
  ) => unitsByMeasurementKey[measurementKey(measurementId, boardId)] ?? fallback

  return {
    levitationDistance,
    levitationCurrent,
    levitationPower,
    dcBusVoltage,
    totalBatteryVoltage,
    levitationDistanceUnit: unitFor(
      SIGNAL_UNITS.levitationDistance.measurementId,
      SIGNAL_UNITS.levitationDistance.boardId,
      SIGNAL_UNITS.levitationDistance.fallback,
    ),
    levitationCurrentUnit: unitFor(
      SIGNAL_UNITS.levitationCurrent.measurementId,
      SIGNAL_UNITS.levitationCurrent.boardId,
      SIGNAL_UNITS.levitationCurrent.fallback,
    ),
    dcBusVoltageUnit: unitFor(
      SIGNAL_UNITS.dcBusVoltage.measurementId,
      SIGNAL_UNITS.dcBusVoltage.boardId,
      SIGNAL_UNITS.dcBusVoltage.fallback,
    ),
    totalBatteryVoltageUnit: unitFor(
      SIGNAL_UNITS.totalBatteryVoltage.measurementId,
      SIGNAL_UNITS.totalBatteryVoltage.boardId,
      SIGNAL_UNITS.totalBatteryVoltage.fallback,
    ),
    packVoltageUnit: unitFor(
      SIGNAL_UNITS.packVoltage.measurementId,
      SIGNAL_UNITS.packVoltage.boardId,
      SIGNAL_UNITS.packVoltage.fallback,
    ),
  }
}

const applyMeasurementUpdate = (
  dictionary: MeasurementDictionary,
  updates: MeasurementUpdate,
) => {
  for (const [key, value] of Object.entries(updates.status)) {
    const entry = dictionary[key]
    if (!entry) continue
    entry.value = value ?? null
  }
}

export const getConnectionUptimeSeconds = (update: MeasurementUpdate) =>
  Number.isFinite(update.uptime) ? Math.max(0, Math.floor(update.uptime)) : 0
