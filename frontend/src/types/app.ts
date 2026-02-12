import type { TelemetryData } from "./telemetry"
import type { TelemetrySignals } from "@/hooks/useTelemetry"
import type { TimeSeriesPoint } from "@/components/SmallChart"

export type TelemetrySeries = {
  levitationDistance: TimeSeriesPoint[]
  levitationCurrent: TimeSeriesPoint[]
  levitationPower: TimeSeriesPoint[]
  dcBusVoltage: TimeSeriesPoint[]
  totalBatteryVoltage: TimeSeriesPoint[]
}

export interface TelemetryOutletContext {
  data: TelemetryData | null
  signals: TelemetrySignals
  series: TelemetrySeries
  status: "connecting" | "open" | "closed"
  lastUpdatedAt: number | null
}
