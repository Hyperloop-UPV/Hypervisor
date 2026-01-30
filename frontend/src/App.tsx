import { useMemo } from "react"
import { Outlet } from "react-router-dom"
import { AppShell } from "./components/AppShell"
import { useTelemetry } from "./hooks/useTelemetry"

const App: React.FC = () => {
  const { data, status, lastUpdatedAt } = useTelemetry("ws://localhost:8080")
  
  // Expanded Mock Data for visualization
  // const data: TelemetryData = {
  //   hvbms: [
  //     { id: 1, cells: [{ id: 1, temp: 42 }], voltage: 390 }, 
  //     { id: 0, cells: [{ id: 1, temp: 45 }], voltage: 382 }
  //   ],
  //   lvbms: { id: 1, cells: [{ id: 1, temp: 30 }], voltage: 24 },
  //   propulsion: { speed: 124, acceleration: 1.2, brakesEngaged: false, status: 'ACCELERATING' },
  //   levitation: { verticalGap: 12.4, lateralOffset: 0.22342343, verticalAccel: 1.0, lateralAccel: 0, magnetTemp: 45 },
  //   cameras: { activeFeeds: 4, recording: true }
  // }

  
  const outletContext = useMemo(
    () => ({ data, status, lastUpdatedAt }),
    [data, status, lastUpdatedAt],
  )

  return (
    <AppShell status={status} lastUpdatedAt={lastUpdatedAt}>
      <Outlet context={outletContext} />
    </AppShell>
  )
}

export default App
