import { LineChart, Line, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

const defaultStroke = "#FF7F24"

export type TimeSeriesPoint = { ts: number; value: number | null; idx: number }

type TimeSeriesLineChartProps = {
  data: TimeSeriesPoint[]
  heightClassName?: string
  stroke?: string
  strokeWidth?: number
}

export function SmallChart({
  data,
  heightClassName = "h-20",
  stroke = defaultStroke,
  strokeWidth = 2,
}: TimeSeriesLineChartProps) {
  return (
    <div className={cn("min-h-[1px] min-w-[1px] w-full", heightClassName)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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
