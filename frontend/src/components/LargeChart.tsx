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

type TimeSeriesDetailChartProps = {
  data: TimeSeriesPoint[]
  stroke?: string
  strokeWidth?: number
  heightClassName?: string
  yAxisWidth?: number
  tooltipLabel: string
  tooltipFormatter: (value: number | null) => string
  formatTime: (ts: number) => string
}

const defaultStroke = "#FF7F24"

export function LargeChart({
  data,
  stroke = defaultStroke,
  strokeWidth = 3,
  heightClassName = "h-72 sm:h-80",
  yAxisWidth = 40,
  tooltipLabel,
  tooltipFormatter,
  formatTime,
}: TimeSeriesDetailChartProps) {
  return (
    <div className={cn("min-h-[1px] min-w-[1px]", heightClassName)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <XAxis
            dataKey="idx"
            type="number"
            allowDecimals={false}
            domain={[0, Math.max(data.length - 1, 0)]}
            tickFormatter={(idx) => {
              const point = data[idx as number]
              if (!point || point.value === null || Number.isNaN(point.ts)) return ""
              return formatTime(point.ts)
            }}
            stroke="#EDEEF0"
            tick={axisTick}
          />
          <YAxis stroke="#EDEEF0" tick={axisTick} width={yAxisWidth} />
          <Tooltip
            labelFormatter={(label) => {
              const point = data[label as number]
              if (!point || point.value === null || Number.isNaN(point.ts)) return ""
              return formatTime(point.ts)
            }}
            formatter={(value) => [tooltipFormatter(value as number | null), tooltipLabel]}
            contentStyle={tooltipStyle}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={strokeWidth}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
