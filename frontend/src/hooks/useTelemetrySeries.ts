import { useRollingTimeSeries } from "@/hooks/useRollingTimeSeries"
import type { TelemetrySignals } from "@/hooks/useTelemetry"

export const useTelemetrySeries = (
  signals: TelemetrySignals,
  lastUpdatedAt: number | null,
) => {
  const levitationDistance = useRollingTimeSeries(signals.levitationDistance, {
    minIntervalMs: 400,
    sampleKey: lastUpdatedAt,
  })
  const levitationCurrent = useRollingTimeSeries(signals.levitationCurrent, {
    minIntervalMs: 400,
    sampleKey: lastUpdatedAt,
  })
  const levitationPower = useRollingTimeSeries(signals.levitationPower, {
    minIntervalMs: 400,
    sampleKey: lastUpdatedAt,
  })
  const dcBusVoltage = useRollingTimeSeries(signals.dcBusVoltage, {
    minIntervalMs: 500,
    sampleKey: lastUpdatedAt,
  })
  const totalBatteryVoltage = useRollingTimeSeries(signals.totalBatteryVoltage, {
    minIntervalMs: 500,
    sampleKey: lastUpdatedAt,
  })

  return {
    levitationDistance,
    levitationCurrent,
    levitationPower,
    dcBusVoltage,
    totalBatteryVoltage,
  }
}
