import { useOutletContext } from "react-router-dom"
import { useMemo } from "react"
import type { TelemetryOutletContext } from "@/types/app"
import { useRollingTimeSeries } from "@/hooks/useRollingTimeSeries"
import { formatTime, formatValue } from "@/lib/demoHelpers"
import { ChartCard } from "@/components/ChartCard"
import { MetricCard } from "@/components/MetricCard"
import { PackVoltageSummary } from "@/components/PackVoltageSummary"

export function BatteriesDemoPage() {
  const { data, signals } = useOutletContext<TelemetryOutletContext>()
  const {
    dcBusVoltage,
    totalBatteryVoltage,
    dcBusVoltageUnit,
    totalBatteryVoltageUnit,
    packVoltageUnit,
  } = signals
  const dcBusLabel = formatValue(dcBusVoltage)
  const totalVoltageLabel = formatValue(totalBatteryVoltage)
  const packVoltageStats = useMemo(() => {
    const packs = data?.hvbms ?? []
    const voltages = packs
      .map((pack) => pack.voltage)
      .filter((voltage): voltage is number => typeof voltage === "number")
    if (voltages.length === 0) {
      return {
        min: null,
        max: null,
        avg: null,
      }
    }
    const total = voltages.reduce((sum, value) => sum + value, 0)
    return {
      min: Math.min(...voltages),
      max: Math.max(...voltages),
      avg: total / voltages.length,
    }
  }, [data])

  const dcBusSeries = useRollingTimeSeries(dcBusVoltage, {
    maxPoints: 120,
    minIntervalMs: 500,
  })
  const totalVoltageSeries = useRollingTimeSeries(totalBatteryVoltage, {
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
          accent="text-white"
        />
      </div>

      <PackVoltageSummary stats={packVoltageStats} unit={packVoltageUnit} formatValue={formatValue} />
    </div>
  )
}
