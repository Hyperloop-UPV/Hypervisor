import { useOutletContext } from "react-router-dom"
import type { TelemetryOutletContext } from "@/types/app"
import { formatBoolean, formatState, formatTime, formatValue } from "@/lib/demoHelpers"
import { ChartCard } from "@/components/ChartCard"
import { MetricCard } from "@/components/MetricCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const StatTile = ({ label, value, unit }: { label: string; value: number | null | undefined; unit: string }) => (
  <div className="rounded-lg border border-white/10 bg-[#141a2b] p-3">
    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">{label}</div>
    <div className="mt-2 text-xl font-black text-white">
      {formatValue(value)}
      <span className="ml-2 text-xs font-bold text-white/50">{unit}</span>
    </div>
  </div>
)

const StatusPill = ({ label, ok }: { label: string; ok: boolean | null | undefined }) => (
  <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#141a2b] p-3">
    <span className="min-w-0 flex-1 text-xs font-bold uppercase tracking-wider text-white/60">{label}</span>
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        ok === null || ok === undefined
          ? "bg-white/10 text-white/50"
          : ok
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-red-500/20 text-red-400",
      )}
    >
      {formatBoolean(ok)}
    </span>
  </div>
)

export function PropulsionDemoPage() {
  const { data, signals, series } = useOutletContext<TelemetryOutletContext>()
  const { propulsionSpeed, propulsionCurrent, propulsionSpeedUnit, propulsionCurrentUnit, propulsionFrequencyUnit } =
    signals
  const propulsion = data?.propulsion

  const speedLabel = formatValue(propulsionSpeed)
  const currentLabel = formatValue(propulsionCurrent)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Propulsion & Motor Control
        </h1>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[2fr_360px]">
        <ChartCard
          title="Vehicle Speed"
          value={speedLabel}
          unit={propulsionSpeedUnit}
          chartData={series.propulsionSpeed}
          tooltipLabel="Speed"
          tooltipFormatter={(value) => `${formatValue(value)} ${propulsionSpeedUnit}`}
          formatTime={formatTime}
        />

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
              State Machine
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-black text-[#FF7F24]">{formatState(propulsion?.state)}</div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <StatTile label="Target Speed" value={propulsion?.targetSpeed} unit={propulsionSpeedUnit} />
              <StatTile label="Speed Error" value={propulsion?.speedError} unit={propulsionSpeedUnit} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Motor Current"
          value={currentLabel}
          unit={propulsionCurrentUnit}
          chartData={series.propulsionCurrent}
        />
        <MetricCard title="Commutation Frequency" value={formatValue(propulsion?.frequency)} unit={propulsionFrequencyUnit} />
        <MetricCard title="Slip" value={formatValue(propulsion?.slipMotor)} unit="%" />
        <MetricCard title="Peak Current" value={formatValue(propulsion?.currentPeak)} unit="A" />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-white">PWM Duty Cycles</h2>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatTile label="Duty U" value={propulsion?.dutyU} unit="%" />
          <StatTile label="Duty V" value={propulsion?.dutyV} unit="%" />
          <StatTile label="Duty W" value={propulsion?.dutyW} unit="%" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-white">Phase Currents</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 xl:grid-cols-6">
          <StatTile label="U - A" value={propulsion?.currentSensors.uA} unit="A" />
          <StatTile label="V - A" value={propulsion?.currentSensors.vA} unit="A" />
          <StatTile label="W - A" value={propulsion?.currentSensors.wA} unit="A" />
          <StatTile label="U - B" value={propulsion?.currentSensors.uB} unit="A" />
          <StatTile label="V - B" value={propulsion?.currentSensors.vB} unit="A" />
          <StatTile label="W - B" value={propulsion?.currentSensors.wB} unit="A" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-white">Gate Driver</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatusPill label="Gate Driver A Ready" ok={propulsion?.gateDriver.readyA} />
          <StatusPill label="Gate Driver B Ready" ok={propulsion?.gateDriver.readyB} />
          <StatusPill label="Gate Driver A Fault" ok={propulsion?.gateDriver.faultA} />
          <StatusPill label="Gate Driver B Fault" ok={propulsion?.gateDriver.faultB} />
        </div>
      </section>
    </div>
  )
}
