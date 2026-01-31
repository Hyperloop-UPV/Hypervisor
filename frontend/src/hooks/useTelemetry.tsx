import { useEffect, useMemo, useRef, useState } from "react"
import type { TelemetryData } from "../types/telemetry"
import { buildBatteryData, buildLevitation } from "@/lib/telemetryBuilders"

type MeasurementDictionaryEntry = {
  measurement_id: string
  board_id: number
  display_units?: string | null
  value?: number | null
}

type MeasurementDictionary = Record<string, MeasurementDictionaryEntry>
type MeasurementUpdate = Record<string, number | null | undefined>

export type TelemetrySignals = {
  levitationDistance: number | null
  levitationCurrent: number | null
  levitationPower: number | null
  dcBusVoltage: number | null
  totalBatteryVoltage: number | null
  levitationDistanceUnit: string
  levitationCurrentUnit: string
  dcBusVoltageUnit: string
  totalBatteryVoltageUnit: string
  packVoltageUnit: string
}

const isMeasurementDictionary = (payload: unknown): payload is MeasurementDictionary => {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) return false
  return Object.values(payload as Record<string, unknown>).every((value) => {
    if (typeof value !== "object" || value === null) return false
    const record = value as { measurement_id?: unknown; board_id?: unknown }
    return typeof record.measurement_id === "string" && typeof record.board_id === "number"
  })
}

const isMeasurementUpdate = (payload: unknown): payload is MeasurementUpdate => {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) return false
  return Object.values(payload as Record<string, unknown>).every(
    (value) => value === null || value === undefined || typeof value === "number",
  )
}

const normalizeValue = (value: number | null | undefined) => {
  if (typeof value !== "number") return null
  return value === -1 ? null : value
}

const buildValueMap = (dictionary: MeasurementDictionary) => {
  const values = new Map<string, number | null>()
  const units: Record<string, string | null | undefined> = {}

  Object.values(dictionary).forEach((entry) => {
    if (typeof entry?.measurement_id !== "string") return
    values.set(entry.measurement_id, normalizeValue(entry.value))
    if (entry.display_units !== undefined) {
      units[entry.measurement_id] = entry.display_units
    }
  })

  return { values, units }
}

const mapDictionaryToTelemetry = (dictionary: MeasurementDictionary): TelemetryData => {
  const { values: valueByMeasurement, units: unitsByMeasurementId } =
    buildValueMap(dictionary)
  const getValue = (measurementId: string) =>
    valueByMeasurement.has(measurementId) ? valueByMeasurement.get(measurementId) : null

  const levitation = buildLevitation(getValue)
  const batteries = buildBatteryData(getValue)

  return {
    ...levitation,
    ...batteries,
    unitsByMeasurementId,
  }
}

const getTelemetrySignals = (data: TelemetryData | null): TelemetrySignals => {
  const levitationDistance = data?.levitation?.verticalGap ?? null
  const levitationCurrent = data?.levitation?.current ?? null
  const levitationPower = data?.levitation?.power ?? null

  const dcBusVoltage = data?.dcBusVoltage ?? null
  const totalBatteryVoltage = data?.totalBatteryVoltage ?? null
  const unitsByMeasurementId = data?.unitsByMeasurementId ?? {}

  const unitFor = (measurementId: string, fallback: string) =>
    unitsByMeasurementId[measurementId] ?? fallback

  return {
    levitationDistance,
    levitationCurrent,
    levitationPower,
    dcBusVoltage,
    totalBatteryVoltage,
    levitationDistanceUnit: unitFor("lcu_airgap_1", "mm"),
    levitationCurrentUnit: unitFor("lcu_coil_current_1", "A"),
    dcBusVoltageUnit: unitFor("voltage_reading", "V"),
    totalBatteryVoltageUnit: unitFor("batteries_voltage_reading", "V"),
    packVoltageUnit: unitFor("battery1_total_voltage", "V"),
  }
}

export const useTelemetry = (url: string) => {
  const [data, setData] = useState<TelemetryData | null>(null)
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting")
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null)
  const dictionaryRef = useRef<MeasurementDictionary>({})

  useEffect(() => {
    const source = new EventSource(url)

    source.onopen = () => setStatus("open")
    source.onerror = () => {
      setStatus(source.readyState === EventSource.CLOSED ? "closed" : "connecting")
    }

    source.onmessage = (event) => {
      const payload = JSON.parse(event.data)
      const now = Date.now()

      if (isMeasurementDictionary(payload)) {
        dictionaryRef.current = { ...payload }
        setData(mapDictionaryToTelemetry(dictionaryRef.current))
        setLastUpdatedAt(now)
        return
      }

      if (!isMeasurementUpdate(payload)) return

      Object.entries(payload).forEach(([key, value]) => {
        const entry = dictionaryRef.current[key]
        if (!entry) return
        entry.value = value ?? null
      })
      setData(mapDictionaryToTelemetry(dictionaryRef.current))
      setLastUpdatedAt(now)
    }

    return () => {
      source.close()
      setStatus("closed")
    }
  }, [url])

  const signals = useMemo(() => getTelemetrySignals(data), [data])

  return { data, status, lastUpdatedAt, signals }
}
