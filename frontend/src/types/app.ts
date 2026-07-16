import type { TelemetryData } from "./telemetry"
import type { TelemetrySignals } from "@/hooks/useTelemetry"
import type { TimeSeriesPoint } from "@/components/SmallChart"

export type TelemetrySeries = {
  levitationDistance: TimeSeriesPoint[]
  levitationCurrent: TimeSeriesPoint[]
  levitationPower: TimeSeriesPoint[]
  dcBusVoltage: TimeSeriesPoint[]
  totalBatteryVoltage: TimeSeriesPoint[]
  propulsionSpeed: TimeSeriesPoint[]
  propulsionCurrent: TimeSeriesPoint[]
  propulsionDutyU: TimeSeriesPoint[]
  propulsionDutyV: TimeSeriesPoint[]
  propulsionDutyW: TimeSeriesPoint[]
  propulsionCurrentUA: TimeSeriesPoint[]
  propulsionCurrentVA: TimeSeriesPoint[]
  propulsionCurrentWA: TimeSeriesPoint[]
  propulsionCurrentUB: TimeSeriesPoint[]
  propulsionCurrentVB: TimeSeriesPoint[]
  propulsionCurrentWB: TimeSeriesPoint[]
}

export interface TelemetryOutletContext {
  data: TelemetryData | null
  signals: TelemetrySignals
  series: TelemetrySeries
  status: "connecting" | "open" | "closed"
  connectionUptimeSeconds: number | null
}
