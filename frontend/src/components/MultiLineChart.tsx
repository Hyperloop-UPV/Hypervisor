import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { axisTick, tooltipStyle } from "@/lib/demoHelpers"
import type { TimeSeriesPoint } from "@/components/SmallChart"
import { cn } from "@/lib/utils"

export type MultiLineSeries = {
  key: string
  label: string
  color: string
  data: TimeSeriesPoint[]
  dash?: string
}

type MultiLineChartProps = {
  series: MultiLineSeries[]
  heightClassName?: string
  yAxisWidth?: number
  unit?: string
  formatTime: (ts: number) => string
}

// Zips independently-sampled rolling series into one recharts dataset, keyed by
// the shared `idx` slot they were all sampled at (all driven off the same
// connectionUptimeSeconds sampleKey, so their slots line up 1:1).
const mergeSeries = (series: MultiLineSeries[]) => {
  const length = Math.max(...series.map((line) => line.data.length), 0)

  return Array.from({ length }, (_, idx) => {
    const point: Record<string, number | null> = { idx }
    let ts = Number.NaN

    for (const line of series) {
      const sample = line.data[idx]
      point[line.key] = sample?.value ?? null
      if (sample && !Number.isNaN(sample.ts)) ts = sample.ts
    }

    point.ts = ts
    return point
  })
}

export function MultiLineChart({
  series,
  heightClassName = "h-72 sm:h-80",
  yAxisWidth = 40,
  unit = "",
  formatTime,
}: MultiLineChartProps) {
  const merged = mergeSeries(series)

  return (
    <div className={cn("min-h-[1px] min-w-[1px]", heightClassName)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <XAxis
            dataKey="idx"
            type="number"
            allowDecimals={false}
            domain={[0, Math.max(merged.length - 1, 0)]}
            tickFormatter={(idx) => {
              const point = merged[idx as number]
              const ts = point?.ts
              if (!point || typeof ts !== "number" || Number.isNaN(ts)) return ""
              return formatTime(ts)
            }}
            stroke="#EDEEF0"
            tick={axisTick}
          />
          <YAxis stroke="#EDEEF0" tick={axisTick} width={yAxisWidth} />
          <Tooltip
            labelFormatter={(label) => {
              const point = merged[label as number]
              const ts = point?.ts
              if (!point || typeof ts !== "number" || Number.isNaN(ts)) return ""
              return formatTime(ts)
            }}
            formatter={(value, name) => {
              const label = series.find((line) => line.key === name)?.label ?? name
              const formatted = typeof value === "number" ? `${value.toFixed(2)}${unit}` : "--"
              return [formatted, label]
            }}
            contentStyle={tooltipStyle}
          />
          {series.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.key}
              stroke={line.color}
              strokeWidth={2.5}
              strokeDasharray={line.dash}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
