import { useOutletContext } from "react-router-dom"
import type { TelemetryOutletContext } from "@/types/app"
import { formatBoolean, formatState, formatTime, formatValue } from "@/lib/demoHelpers"
import { ChartCard } from "@/components/ChartCard"
import { MetricCard } from "@/components/MetricCard"
import { MultiLineChart, type MultiLineSeries } from "@/components/MultiLineChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Shared U/V/W color mapping so duty cycles and phase currents read as the
// same three phases across both charts.
const PHASE_COLORS = {
  u: "#FF7F24",
  v: "#38BDF8",
  w: "#A78BFA",
} as const

const CONNECTOR_B_DASH = "6 4"

const StatTile = ({ label, value, unit }: { label: string; value: number | null | undefined; unit: string }) => (
  <div className="rounded-lg border border-white/10 bg-[#141a2b] p-3">
    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">{label}</div>
    <div className="mt-2 text-xl font-black text-white">
      {formatValue(value)}
      <span className="ml-2 text-xs font-bold text-white/50">{unit}</span>
    </div>
  </div>
)

type PhaseLine = MultiLineSeries & { value: number | null | undefined }

const PhaseChartCard = ({ title, lines, unit }: { title: string; lines: PhaseLine[]; unit: string }) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-lg font-bold text-white">{title}</h2>
    <Card>
      <CardContent className="p-4 pt-4">
        <div className="mb-4 flex flex-wrap gap-4">
          {lines.map((line) => (
            <div key={line.key} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: line.color, opacity: line.dash ? 0.55 : 1 }}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">{line.label}</span>
              <span className="text-sm font-black text-white">
                {formatValue(line.value)}
                {unit}
              </span>
            </div>
          ))}
        </div>
        <MultiLineChart series={lines} unit={unit} heightClassName="h-64" formatTime={formatTime} />
      </CardContent>
    </Card>
  </section>
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

  const dutyLines: PhaseLine[] = [
    { key: "dutyU", label: "Duty U", color: PHASE_COLORS.u, value: propulsion?.dutyU, data: series.propulsionDutyU },
    { key: "dutyV", label: "Duty V", color: PHASE_COLORS.v, value: propulsion?.dutyV, data: series.propulsionDutyV },
    { key: "dutyW", label: "Duty W", color: PHASE_COLORS.w, value: propulsion?.dutyW, data: series.propulsionDutyW },
  ]

  const phaseCurrentLines: PhaseLine[] = [
    { key: "currentUA", label: "U - A", color: PHASE_COLORS.u, value: propulsion?.currentSensors.uA, data: series.propulsionCurrentUA },
    { key: "currentVA", label: "V - A", color: PHASE_COLORS.v, value: propulsion?.currentSensors.vA, data: series.propulsionCurrentVA },
    { key: "currentWA", label: "W - A", color: PHASE_COLORS.w, value: propulsion?.currentSensors.wA, data: series.propulsionCurrentWA },
    { key: "currentUB", label: "U - B", color: PHASE_COLORS.u, value: propulsion?.currentSensors.uB, data: series.propulsionCurrentUB, dash: CONNECTOR_B_DASH },
    { key: "currentVB", label: "V - B", color: PHASE_COLORS.v, value: propulsion?.currentSensors.vB, data: series.propulsionCurrentVB, dash: CONNECTOR_B_DASH },
    { key: "currentWB", label: "W - B", color: PHASE_COLORS.w, value: propulsion?.currentSensors.wB, data: series.propulsionCurrentWB, dash: CONNECTOR_B_DASH },
  ]

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

      <div className="grid gap-6 lg:grid-cols-2">
        <PhaseChartCard title="PWM Duty Cycles" lines={dutyLines} unit="%" />
        <PhaseChartCard title="Phase Currents" lines={phaseCurrentLines} unit="A" />
      </div>

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
