import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SmallChart } from "@/components/SmallChart"
import type { TimeSeriesPoint } from "@/components/SmallChart"

export type MetricCardProps = {
  title: string
  value: string
  unit: string
  accentClassName?: string
  chartData?: TimeSeriesPoint[]
  chartHeightClassName?: string
}

export function MetricCard({
  title,
  value,
  unit,
  accentClassName = "text-white",
  chartData,
  chartHeightClassName,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className={`text-3xl font-black sm:text-4xl ${accentClassName}`}>
          {value} <span className="text-sm text-white/60">{unit}</span>
        </div>
        {chartData ? (
          <SmallChart data={chartData} heightClassName={chartHeightClassName} />
        ) : null}
      </CardContent>
    </Card>
  )
}
