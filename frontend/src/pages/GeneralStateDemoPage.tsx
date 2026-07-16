import { useOutletContext } from "react-router-dom"
import type { TelemetryOutletContext } from "@/types/app"
import { formatBoolean, formatState, formatValue } from "@/lib/demoHelpers"
import { MetricCard } from "@/components/MetricCard"
import { PodTrackVisualizer } from "@/components/PodTrackVisualizer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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

export function GeneralStateDemoPage() {
  const { data } = useOutletContext<TelemetryOutletContext>()
  const vehicleState = data?.vehicleState

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Vehicle State
        </h1>
      </div>

      <PodTrackVisualizer positionM={data?.propulsion?.positionM} />

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
            Master State Machine
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-3xl font-black text-[#FF7F24]">{formatState(vehicleState?.state)}</div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-white">Pneumatics</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <MetricCard title="High Pressure" value={formatValue(vehicleState?.pressures.high)} unit="bar" />
          <MetricCard title="Low Pressure" value={formatValue(vehicleState?.pressures.low)} unit="bar" />
          <MetricCard
            title="Pressure Regulator Feedback"
            value={formatValue(vehicleState?.pressures.regulatorFeedback)}
            unit="bar"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-white">Brakes & Outputs</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <StatusPill label="Brakes Active" ok={vehicleState?.brakes.active} />
          <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#141a2b] p-3">
            <span className="min-w-0 flex-1 text-xs font-bold uppercase tracking-wider text-white/60">Brakes Status</span>
            <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-white">
              {formatState(vehicleState?.brakes.status)}
            </span>
          </div>
          <StatusPill label="Electrovalve Enabled" ok={vehicleState?.electrovalveEnabled} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-white">Safety & Connections</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatusPill label="SDC Closed" ok={vehicleState?.safety.sdcClosed} />
          <StatusPill label="HVBMS Connected" ok={vehicleState?.safety.hvbmsConnected} />
          <StatusPill label="PCU Connected" ok={vehicleState?.safety.pcuConnected} />
          <StatusPill label="LCU Connected" ok={vehicleState?.safety.lcuConnected} />
        </div>
      </section>
    </div>
  )
}
