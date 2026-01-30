import { useOutletContext } from "react-router-dom"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TelemetryOutletContext } from "@/types/app"
import { useTelemetrySignals } from "@/hooks/useTelemetrySignals"
import { useRollingTimeSeries } from "@/hooks/useRollingTimeSeries"

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })
const formatValue = (value: number | null | undefined) =>
  typeof value === "number" ? value.toFixed(2) : "--"

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

function MiniLineChart({ data }: { data: { ts: number; value: number | null }[] }) {
  return (
    <div className="h-20 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="#FF7F24" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function LevitationDemoPage() {
  const { data } = useOutletContext<TelemetryOutletContext>()
  const { levitationDistance, levitationCurrent, levitationPower } = useTelemetrySignals(data)

  const distanceSeries = useRollingTimeSeries(levitationDistance, {
    maxPoints: 120,
    minIntervalMs: 400,
  })
  const currentSeries = useRollingTimeSeries(levitationCurrent, {
    maxPoints: 120,
    minIntervalMs: 400,
  })
  const powerSeries = useRollingTimeSeries(levitationPower, {
    maxPoints: 120,
    minIntervalMs: 400,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Levitation Distance & Control
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_360px]">
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60">
              Levitation Distance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-baseline gap-3">
              <div className="text-4xl sm:text-5xl font-black text-[#FF7F24]">
                {formatValue(levitationDistance)}
              </div>
              <div className="text-sm font-bold uppercase text-white/60">mm</div>
            </div>
            <div className="mt-4 h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={distanceSeries}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="ts"
                    tickFormatter={formatTime}
                    stroke="#EDEEF0"
                    tick={{ fill: "#EDEEF0", fontSize: 10 }}
                  />
                  <YAxis
                    stroke="#EDEEF0"
                    tick={{ fill: "#EDEEF0", fontSize: 10 }}
                    width={40}
                  />
                  <Tooltip
                    labelFormatter={(label) => formatTime(label as number)}
                    formatter={(value) => [`${formatValue(value as number)} mm`, "Distance"]}
                    contentStyle={{
                      background: "#20274C",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#FF7F24"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60">
                Pod Distance Visualizer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="w-full sm:w-56 shrink-0">
                  <div className="relative h-40 rounded-xl border border-white/10 bg-[#1a2035] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-4 h-3 w-10 rounded-full bg-[#EDEEF0]/60 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                    <div
                      className="absolute left-1/2 -translate-x-1/2 h-2 w-12 rounded-full bg-[#FF7F24] shadow-[0_0_12px_rgba(255,127,36,0.7)]"
                      style={{
                        bottom: `${
                          levitationDistance !== null && levitationDistance !== undefined
                            ? clamp(((levitationDistance - 8) / 8) * 100, 8, 90)
                            : 50
                        }%`,
                      }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/40">
                    <span>LOW</span>
                    <span>HIGH</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-[#FF7F24]">
                    {formatValue(levitationDistance)}
                  </div>
                  <div className="text-xs font-bold uppercase text-white/60">mm gap</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60">
                Current
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-3xl sm:text-4xl font-black text-white">
                {formatValue(levitationCurrent)} <span className="text-sm text-white/60">A</span>
              </div>
              <MiniLineChart data={currentSeries} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60">
                Power
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-3xl sm:text-4xl font-black text-white">
                {formatValue(levitationPower)} <span className="text-sm text-white/60">W</span>
              </div>
              <MiniLineChart data={powerSeries} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
