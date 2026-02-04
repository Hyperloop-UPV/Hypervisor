import { useOutletContext } from "react-router-dom"
import type { TelemetryOutletContext } from "@/types/app"
import { useRollingTimeSeries } from "@/hooks/useRollingTimeSeries"
import { formatTime, formatValue } from "@/lib/demoHelpers"
import { ChartCard } from "@/components/ChartCard"
import { MetricCard } from "@/components/MetricCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


const buildCellVoltageStats = (cells: { voltage?: number | null }[]) => {
  const voltages = cells
    .map((cell) => cell.voltage)
    .filter((voltage): voltage is number => typeof voltage === "number")
  if (voltages.length === 0) {
    return { min: null, max: null, avg: null }
  }
  const total = voltages.reduce((sum, value) => sum + value, 0)
  return {
    min: Math.min(...voltages),
    max: Math.max(...voltages),
    avg: total / voltages.length,
  }
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

export function BatteriesDemoPage() {
  const { data, signals, lastUpdatedAt } = useOutletContext<TelemetryOutletContext>()
  const {
    dcBusVoltage,
    totalBatteryVoltage,
    dcBusVoltageUnit,
    totalBatteryVoltageUnit,
    packVoltageUnit,
  } = signals
  const dcBusLabel = formatValue(dcBusVoltage)
  const totalVoltageLabel = formatValue(totalBatteryVoltage)
  const packs = data?.hvbms ?? []

  const dcBusSeries = useRollingTimeSeries(dcBusVoltage, {
    maxPoints: 120,
    minIntervalMs: 500,
    sampleKey: lastUpdatedAt,
  })
  const totalVoltageSeries = useRollingTimeSeries(totalBatteryVoltage, {
    maxPoints: 120,
    minIntervalMs: 500,
    sampleKey: lastUpdatedAt,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          DC Bus Precharge & Pack Health
        </h1>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="DC Bus Voltage"
            value={dcBusLabel}
            unit={dcBusVoltageUnit}
            chartData={dcBusSeries}
            tooltipLabel="DC Bus"
            tooltipFormatter={(value) => `${formatValue(value)} ${dcBusVoltageUnit}`}
            formatTime={formatTime}
          />
        </div>

        <MetricCard
          title="Total Battery Voltage"
          value={totalVoltageLabel}
          unit={totalBatteryVoltageUnit}
          chartData={totalVoltageSeries}
          chartHeightClassName="h-24"
          accentClassName="text-white"
        />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-white">Battery Packs</h2>
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            {packs.length} Packs
          </div>
        </div>

        {packs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-white/60">
              Waiting for battery pack telemetry.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {packs.map((pack, index) => {
              const packId = pack.id ?? index + 1
              const packLabel = `Pack ${String(packId).padStart(2, "0")}`
              const stats = buildCellVoltageStats(pack.cells)
              return (
                <Card key={packId}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                      {packLabel}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <StatTile label="Minimum" value={stats.min} unit={packVoltageUnit} formatValue={formatValue} />
                      <StatTile label="Average" value={stats.avg} unit={packVoltageUnit} formatValue={formatValue} highlight />
                      <StatTile label="Maximum" value={stats.max} unit={packVoltageUnit} formatValue={formatValue} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
