import { useEffect, useMemo, useRef, useState } from "react"
import type { TelemetryData } from "../types/telemetry"
import type { MeasurementDictionary } from "@/hooks/telemetryUtils"
import {
  applyMeasurementUpdate,
  buildTelemetryData,
  getTelemetrySignals,
  isMeasurementDictionary,
  isMeasurementUpdate,
} from "@/hooks/telemetryUtils"

export type TelemetrySignals = ReturnType<typeof getTelemetrySignals>

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
        setData(buildTelemetryData(dictionaryRef.current))
        setLastUpdatedAt(now)
        return
      }

      if (!isMeasurementUpdate(payload)) return
      applyMeasurementUpdate(dictionaryRef.current, payload)
      setData(buildTelemetryData(dictionaryRef.current))
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
