import type { TelemetryData } from "../types/telemetry"

export function useTelemetrySignals(data: TelemetryData | null) {
  const levitationDistance = data?.levitation?.verticalGap ?? null
  const levitationCurrent = data?.levitation?.current ?? null
  const levitationPower = data?.levitation?.power ?? null

  const dcBusVoltage = data?.dcBusVoltage ?? data?.hvbms?.[0]?.voltage ?? null
  const totalBatteryVoltage =
    data?.hvbms && data.hvbms.length > 0
      ? data.hvbms.reduce((sum, pack) => sum + (pack?.voltage ?? 0), 0)
      : data?.lvbms?.voltage ?? null

  return {
    levitationDistance,
    levitationCurrent,
    levitationPower,
    dcBusVoltage,
    totalBatteryVoltage,
  }
}
