import type { TelemetryData } from "./telemetry"
import type { TelemetrySignals } from "@/hooks/useTelemetry"

export interface TelemetryOutletContext {
  data: TelemetryData | null
  signals: TelemetrySignals
  status: "connecting" | "open" | "closed"
  lastUpdatedAt: number | null
}
