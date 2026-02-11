import { useMemo } from "react"
import { Outlet } from "react-router-dom"
import { AppShell } from "./components/AppShell"
import { useTelemetry } from "./hooks/useTelemetry"
import { useTelemetrySeries } from "./hooks/useTelemetrySeries"

const App: React.FC = () => {
  const { data, status, lastUpdatedAt, signals } = useTelemetry(import.meta.env.VITE_SSE_URL)
  const series = useTelemetrySeries(signals, lastUpdatedAt)

  const outletContext = useMemo(
    () => ({
      data,
      signals,
      series,
      status,
      lastUpdatedAt,
    }),
    [data, signals, series, status, lastUpdatedAt],
  )
  return (
    <AppShell status={status} lastUpdatedAt={lastUpdatedAt}>
      <Outlet context={outletContext} />
    </AppShell>
  )
}

export default App
