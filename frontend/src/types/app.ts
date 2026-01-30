import type { TelemetryData } from "./telemetry"

export interface TelemetryOutletContext {
  data: TelemetryData | null
  status: "connecting" | "open" | "closed"
  lastUpdatedAt: number | null
}
