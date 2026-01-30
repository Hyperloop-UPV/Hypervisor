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
import { useMemo } from "react"
import type { TelemetryOutletContext } from "@/types/app"
import { useTelemetrySignals } from "@/hooks/useTelemetrySignals"
import { useRollingTimeSeries } from "@/hooks/useRollingTimeSeries"

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })
const formatValue = (value: number | null | undefined) =>
  typeof value === "number" ? value.toFixed(2) : "--"

export function BatteriesDemoPage() {
  const { data } = useOutletContext<TelemetryOutletContext>()
  const { dcBusVoltage, totalBatteryVoltage } = useTelemetrySignals(data)
  const cellList = useMemo(
    () =>
      data?.hvbms?.flatMap((pack) =>
        (pack.cells ?? []).map((cell, index) => ({
          ...cell,
          packId: pack.id ?? 0,
          cellIndex: index,
        })),
      ) ?? [],
    [data],
  )

  const dcBusSeries = useRollingTimeSeries(dcBusVoltage, {
    maxPoints: 120,
    minIntervalMs: 500,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          DC Bus Precharge & Pack Health
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60">
              DC Bus Voltage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-baseline gap-3">
              <div className="text-4xl sm:text-5xl font-black text-[#FF7F24]">
                {formatValue(dcBusVoltage)}
              </div>
              <div className="text-sm font-bold uppercase text-white/60">V</div>
            </div>
            <div className="mt-4 h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dcBusSeries}>
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
                    formatter={(value) => [`${formatValue(value as number)} V`, "DC Bus"]}
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

        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60">
              Total Battery Voltage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 flex flex-col justify-between h-full">
            <div className="text-4xl sm:text-5xl font-black text-white">
              {formatValue(totalBatteryVoltage)}{" "}
              <span className="text-base font-bold text-white/60">V</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60">
            Cell Voltages (96)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          <div className="max-h-[320px] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
              {cellList.length === 0 && (
                <div className="col-span-full text-xs text-white/60">
                  Waiting for cell telemetry…
                </div>
              )}
              {cellList.map((cell) => (
                <div
                  key={`${cell.packId}-${cell.id ?? cell.cellIndex}`}
                  className="rounded-lg border border-white/10 bg-[#1a2035] px-2 py-2 text-center"
                >
                  <div className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                    {cell.id ?? cell.cellIndex + 1}
                  </div>
                  <div className="text-sm font-black text-[#FF7F24]">
                    {formatValue(cell.voltage)}
                    <span className="text-[9px] font-bold text-white/50">V</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
