import { useEffect, useMemo, useRef, useState } from "react"

interface RollingSeriesPoint {
  ts: number
  value: number | null
}

export interface RollingSeriesPointWithIndex extends RollingSeriesPoint {
  idx: number
}


interface RollingSeriesOptions {
  minIntervalMs?: number
  sampleKey?: number | null
}

export function useRollingTimeSeries(
  value: number | null | undefined,
  options: RollingSeriesOptions = {},
) {
  const { minIntervalMs = 500, sampleKey } = options
  const slotCount = 20
  const [series, setSeries] = useState<RollingSeriesPoint[]>([])
  const lastAppendRef = useRef(0)

  useEffect(() => {
    const now = Date.now()
    if (now - lastAppendRef.current < minIntervalMs) {
      return
    }
    lastAppendRef.current = now

    setSeries((prev) => {
      const next = [...prev, { ts: now, value: typeof value === "number" ? value : null }]
      if (next.length <= slotCount) return next
      return next.slice(next.length - slotCount)
    })
  }, [value, sampleKey, minIntervalMs, slotCount])

  const paddedSeries = useMemo<RollingSeriesPointWithIndex[]>(() => {
    const next = series.slice(-slotCount)
    if (next.length < slotCount) {
      const padding = Array.from({ length: slotCount - next.length }, () => ({
        ts: Number.NaN,
        value: null,
      }))
      next.push(...padding)
    }
    return next.map((point, idx) => ({ ...point, idx }))
  }, [series, slotCount])

  return paddedSeries
}
