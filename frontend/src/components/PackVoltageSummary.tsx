import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type PackVoltageStats = {
  min: number | null
  max: number | null
  avg: number | null
}

type PackVoltageSummaryProps = {
  stats: PackVoltageStats
  unit: string
  formatValue: (value: number | null | undefined) => string
}

const StatTile = ({ label, value, unit, formatValue, highlight = false }: {
  label: string
  value: number | null
  unit: string
  formatValue: (value: number | null | undefined) => string
  highlight?: boolean
}) => (
  <div className="rounded-lg border border-white/10 bg-[#141a2b] p-3">
    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
      {label}
    </div>
    <div className={`mt-2 text-2xl font-black ${highlight ? "text-[#FF7F24]" : "text-white"}`}>
      {formatValue(value)}
      <span className="ml-2 text-xs font-bold text-white/50">{unit}</span>
    </div>
  </div>
)

export function PackVoltageSummary({ stats, unit, formatValue }: PackVoltageSummaryProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60">
          Pack Voltage Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Minimum Pack" value={stats.min} unit={unit} formatValue={formatValue} />
          <StatTile label="Average Pack" value={stats.avg} unit={unit} formatValue={formatValue} highlight />
          <StatTile label="Maximum Pack" value={stats.max} unit={unit} formatValue={formatValue} />
        </div>
      </CardContent>
    </Card>
  )
}
