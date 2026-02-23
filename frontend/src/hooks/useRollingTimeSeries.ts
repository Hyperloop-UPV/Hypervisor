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

const ROLLING_SLOT_COUNT = 20

export function useRollingTimeSeries(
  value: number | null | undefined,
  options: RollingSeriesOptions = {},
) {
  const { minIntervalMs = 500, sampleKey } = options
  const [series, setSeries] = useState<RollingSeriesPoint[]>([])
  const lastAppendRef = useRef(0)

  useEffect(() => {
    const now = Date.now()
    if (now - lastAppendRef.current < minIntervalMs) {
      return
    }
    lastAppendRef.current = now

    setSeries((prev) => {
      // Store raw points and trim from the left to keep a fixed-size rolling window.
      const next = [...prev, { ts: now, value: typeof value === "number" ? value : null }]
      if (next.length <= ROLLING_SLOT_COUNT) return next
      return next.slice(next.length - ROLLING_SLOT_COUNT)
    })
  }, [value, sampleKey, minIntervalMs])

  const paddedSeries = useMemo<RollingSeriesPointWithIndex[]>(() => {
    const next = series.slice(-ROLLING_SLOT_COUNT)
    if (next.length < ROLLING_SLOT_COUNT) {
      // Charts should keep stable axes from the first frame, so pad missing points.
      const padding = Array.from({ length: ROLLING_SLOT_COUNT - next.length }, () => ({
        ts: Number.NaN,
        value: null,
      }))
      next.push(...padding)
    }
    return next.map((point, idx) => ({ ...point, idx }))
  }, [series])

  return paddedSeries
}
