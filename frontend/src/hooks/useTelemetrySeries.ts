import { useRollingTimeSeries } from "@/hooks/useRollingTimeSeries"
import type { TelemetrySignals } from "@/hooks/useTelemetry"

const SERIES_SAMPLE_CONFIG = {
  levitationDistance: 400,
  levitationCurrent: 400,
  levitationPower: 400,
  dcBusVoltage: 500,
  totalBatteryVoltage: 500,
} as const

export const useTelemetrySeries = (
  signals: TelemetrySignals,
  connectionUptimeSeconds: number | null,
) => {
  // All chart sampling rates live in one map so tuning the dashboard cadence
  // does not require hunting through repeated hook calls.
  const levitationDistance = useRollingTimeSeries(signals.levitationDistance, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.levitationDistance,
    sampleKey: connectionUptimeSeconds,
  })
  const levitationCurrent = useRollingTimeSeries(signals.levitationCurrent, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.levitationCurrent,
    sampleKey: connectionUptimeSeconds,
  })
  const levitationPower = useRollingTimeSeries(signals.levitationPower, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.levitationPower,
    sampleKey: connectionUptimeSeconds,
  })
  const dcBusVoltage = useRollingTimeSeries(signals.dcBusVoltage, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.dcBusVoltage,
    sampleKey: connectionUptimeSeconds,
  })
  const totalBatteryVoltage = useRollingTimeSeries(signals.totalBatteryVoltage, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.totalBatteryVoltage,
    sampleKey: connectionUptimeSeconds,
  })

  return {
    levitationDistance,
    levitationCurrent,
    levitationPower,
    dcBusVoltage,
    totalBatteryVoltage,
  }
}
