import { useMemo } from "react"
import { Outlet } from "react-router-dom"
import { AppShell } from "./components/AppShell"
import { useTelemetry } from "./hooks/useTelemetry"
import { useTelemetrySeries } from "./hooks/useTelemetrySeries"

const App: React.FC = () => {
  const { data, status, connectionUptimeSeconds, signals } = useTelemetry("/backend/stream")
  const series = useTelemetrySeries(signals, connectionUptimeSeconds)

  const outletContext = useMemo(
    () => ({
      data,
      signals,
      series,
      status,
      connectionUptimeSeconds,
    }),
    [data, signals, series, status, connectionUptimeSeconds],
  )
  return (
    <AppShell status={status} connectionUptimeSeconds={connectionUptimeSeconds}>
      <Outlet context={outletContext} />
    </AppShell>
  )
}

export default App
