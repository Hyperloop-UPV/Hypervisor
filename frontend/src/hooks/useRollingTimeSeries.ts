import { useEffect, useRef, useState } from "react"

interface RollingSeriesPoint {
  ts: number
  value: number | null
}

interface RollingSeriesOptions {
  maxPoints?: number
  minIntervalMs?: number
}

export function useRollingTimeSeries(
  value: number | null | undefined,
  options: RollingSeriesOptions = {},
) {
  const { maxPoints = 120, minIntervalMs = 500 } = options
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
      if (next.length <= maxPoints) return next
      return next.slice(next.length - maxPoints)
    })
  }, [value, maxPoints, minIntervalMs])

  return series
}
