import { useRollingTimeSeries } from "@/hooks/useRollingTimeSeries"
import type { TelemetrySignals } from "@/hooks/useTelemetry"

const SERIES_SAMPLE_CONFIG = {
  levitationDistance: 400,
  levitationCurrent: 400,
  levitationPower: 400,
  dcBusVoltage: 500,
  totalBatteryVoltage: 500,
  propulsionSpeed: 400,
  propulsionCurrent: 400,
  propulsionDutyU: 300,
  propulsionDutyV: 300,
  propulsionDutyW: 300,
  propulsionCurrentUA: 300,
  propulsionCurrentVA: 300,
  propulsionCurrentWA: 300,
  propulsionCurrentUB: 300,
  propulsionCurrentVB: 300,
  propulsionCurrentWB: 300,
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
  const propulsionSpeed = useRollingTimeSeries(signals.propulsionSpeed, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.propulsionSpeed,
    sampleKey: connectionUptimeSeconds,
  })
  const propulsionCurrent = useRollingTimeSeries(signals.propulsionCurrent, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.propulsionCurrent,
    sampleKey: connectionUptimeSeconds,
  })
  const propulsionDutyU = useRollingTimeSeries(signals.propulsionDutyU, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.propulsionDutyU,
    sampleKey: connectionUptimeSeconds,
  })
  const propulsionDutyV = useRollingTimeSeries(signals.propulsionDutyV, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.propulsionDutyV,
    sampleKey: connectionUptimeSeconds,
  })
  const propulsionDutyW = useRollingTimeSeries(signals.propulsionDutyW, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.propulsionDutyW,
    sampleKey: connectionUptimeSeconds,
  })
  const propulsionCurrentUA = useRollingTimeSeries(signals.propulsionCurrentUA, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.propulsionCurrentUA,
    sampleKey: connectionUptimeSeconds,
  })
  const propulsionCurrentVA = useRollingTimeSeries(signals.propulsionCurrentVA, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.propulsionCurrentVA,
    sampleKey: connectionUptimeSeconds,
  })
  const propulsionCurrentWA = useRollingTimeSeries(signals.propulsionCurrentWA, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.propulsionCurrentWA,
    sampleKey: connectionUptimeSeconds,
  })
  const propulsionCurrentUB = useRollingTimeSeries(signals.propulsionCurrentUB, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.propulsionCurrentUB,
    sampleKey: connectionUptimeSeconds,
  })
  const propulsionCurrentVB = useRollingTimeSeries(signals.propulsionCurrentVB, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.propulsionCurrentVB,
    sampleKey: connectionUptimeSeconds,
  })
  const propulsionCurrentWB = useRollingTimeSeries(signals.propulsionCurrentWB, {
    minIntervalMs: SERIES_SAMPLE_CONFIG.propulsionCurrentWB,
    sampleKey: connectionUptimeSeconds,
  })

  return {
    levitationDistance,
    levitationCurrent,
    levitationPower,
    dcBusVoltage,
    totalBatteryVoltage,
    propulsionSpeed,
    propulsionCurrent,
    propulsionDutyU,
    propulsionDutyV,
    propulsionDutyW,
    propulsionCurrentUA,
    propulsionCurrentVA,
    propulsionCurrentWA,
    propulsionCurrentUB,
    propulsionCurrentVB,
    propulsionCurrentWB,
  }
}
