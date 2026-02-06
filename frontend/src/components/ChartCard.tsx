import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LargeChart } from "@/components/LargeChart"
import type { TimeSeriesPoint } from "@/components/SmallChart"

type ChartCardProps = {
  title: string
  value: string
  unit: string
  chartData: TimeSeriesPoint[]
  tooltipLabel: string
  tooltipFormatter: (value: number | null) => string
  formatTime: (ts: number) => string
}

export function ChartCard({
  title,
  value,
  unit,
  chartData,
  tooltipLabel,
  tooltipFormatter,
  formatTime,
}: ChartCardProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-baseline gap-3">
          <div className="text-4xl sm:text-5xl font-black text-[#FF7F24]">{value}</div>
          <div className="text-sm font-bold uppercase text-white/60">{unit}</div>
        </div>
        <div className="mt-4">
          <LargeChart
            data={chartData}
            tooltipLabel={tooltipLabel}
            tooltipFormatter={tooltipFormatter}
            formatTime={formatTime}
          />
        </div>
      </CardContent>
    </Card>
  )
}
