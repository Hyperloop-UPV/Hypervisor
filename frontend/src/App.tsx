import { useMemo } from "react"
import { Outlet } from "react-router-dom"
import { AppShell } from "./components/AppShell"
import { useTelemetry } from "./hooks/useTelemetry"

const App: React.FC = () => {
  const { data, status, lastUpdatedAt, signals } = useTelemetry("http://localhost:4040/telemetry")

  const outletContext = useMemo(
    () => ({ data, signals, status, lastUpdatedAt }),
    [data, signals, status, lastUpdatedAt],
  )
  return (
    <AppShell status={status} lastUpdatedAt={lastUpdatedAt}>
      <Outlet context={outletContext} />
    </AppShell>
  )
}

export default App
