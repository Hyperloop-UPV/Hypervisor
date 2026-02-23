import { useRollingTimeSeries } from "@/hooks/useRollingTimeSeries";
import type { TelemetrySignals } from "@/hooks/useTelemetry";

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
    minIntervalMs: 400,
    sampleKey: lastUpdatedAt,
  });
  const levitationCurrent = useRollingTimeSeries(signals.levitationCurrent, {
    minIntervalMs: 400,
    sampleKey: lastUpdatedAt,
  });
  const levitationPower = useRollingTimeSeries(signals.levitationPower, {
    minIntervalMs: 400,
    sampleKey: lastUpdatedAt,
  });
  const dcBusVoltage = useRollingTimeSeries(signals.dcBusVoltage, {
    minIntervalMs: 500,
    sampleKey: lastUpdatedAt,
  });
  const totalBatteryVoltage = useRollingTimeSeries(
    signals.totalBatteryVoltage,
    {
      minIntervalMs: 500,
      sampleKey: lastUpdatedAt,
    },
  );

  return {
    levitationDistance,
    levitationCurrent,
    levitationPower,
    dcBusVoltage,
    totalBatteryVoltage,
  };
};
