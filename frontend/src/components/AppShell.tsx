import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import logo from "@/assets/logo.svg"

interface AppShellProps {
  status: "connecting" | "open" | "closed"
  connectionUptimeSeconds: number | null
  children: React.ReactNode
}

const statusLabelMap = {
  connecting: "CONNECTING",
  open: "LIVE",
  closed: "OFFLINE",
} as const

const navItems = [
  { to: "/levitation", label: "Levitation Demo" },
  { to: "/batteries", label: "Batteries & HV" },
] as const

export function AppShell({
  status,
  connectionUptimeSeconds,
  children,
}: AppShellProps) {
  const statusLabel = statusLabelMap[status]
  const uptime =
    connectionUptimeSeconds !== null
      ? formatDuration(connectionUptimeSeconds)
      : "--:--:--"

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#20274C] text-[#EDEEF0]">
      <header className="w-full border-b border-white/10 bg-[#20274C]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center">
              <img src={logo} alt="Hyperloop UPV" className="h-8 w-8" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
                HYPERVISOR
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60">
                DEMO DASHBOARD
              </div>
            </div>
          </div>

          <nav className="flex h-11 w-full items-stretch gap-2 rounded-full border border-white/10 bg-[#1a2035] p-1 sm:w-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex h-full flex-1 items-center justify-center rounded-full px-3 py-2 text-center text-[11px] font-bold uppercase leading-none tracking-wider whitespace-nowrap transition-colors sm:px-4 sm:text-sm",
                    isActive
                      ? "bg-[#FF7F24] text-black"
                      : "text-[#EDEEF0]/70 hover:text-white",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#EDEEF0]/70">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  status === "open" && "bg-emerald-400",
                  status === "connecting" && "bg-amber-400 animate-pulse",
                  status === "closed" && "bg-red-500",
                )}
              />
              <span className="font-bold text-[#EDEEF0]">{statusLabel}</span>
            </div>
            <div className="hidden sm:block">UPTIME</div>
            <div className="font-bold text-white">{uptime}</div>
          </div>
        </div>
      </header>

      <main className="w-full flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</div>
      </main>
    </div>
  )
}

const formatDuration = (totalSeconds: number) => {
  // Backend sends uptime as elapsed seconds since stream start.
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":")
}
