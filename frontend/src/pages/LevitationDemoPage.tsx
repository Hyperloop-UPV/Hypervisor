import { useOutletContext } from "react-router-dom"
import type { TelemetryOutletContext } from "@/types/app"
import { formatTime, formatValue } from "@/lib/demoHelpers"
import { ChartCard } from "@/components/ChartCard"
import { MetricCard } from "@/components/MetricCard"
import { PodDistanceVisualizer } from "@/components/PodDistanceVisualizer"

export function LevitationDemoPage() {
  const { signals, series } = useOutletContext<TelemetryOutletContext>()
  const {
    levitationDistance,
    levitationCurrent,
    levitationPower,
    levitationDistanceUnit,
    levitationCurrentUnit,
  } = signals
  const distanceUnit = levitationDistanceUnit ?? "mm"
  const currentUnit = levitationCurrentUnit ?? "A"
  const distanceLabel = formatValue(levitationDistance)
  const currentLabel = formatValue(levitationCurrent)
  const powerLabel = formatValue(levitationPower)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Levitation Distance & Control
        </h1>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[2fr_360px]">
        <ChartCard
          title="Levitation Distance"
          value={distanceLabel}
          unit={distanceUnit}
          chartData={series.levitationDistance}
          tooltipLabel="Distance"
          tooltipFormatter={(value) => `${formatValue(value)} ${distanceUnit}`}
          formatTime={formatTime}
        />

        <PodDistanceVisualizer
          distance={levitationDistance}
          unit={distanceUnit}
          label={distanceLabel}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MetricCard
          title="Current"
          value={currentLabel}
          unit={currentUnit}
          chartData={series.levitationCurrent}
        />

        <MetricCard
          title="Power"
          value={powerLabel}
          unit="W"
          chartData={series.levitationPower}
        />
      </div>
    </div>
  )
}
