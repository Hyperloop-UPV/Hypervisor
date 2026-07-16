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
  { to: "/state", label: "Vehicle State" },
  { to: "/levitation", label: "Levitation" },
  { to: "/batteries", label: "Batteries & HV" },
  { to: "/propulsion", label: "Propulsion" },
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
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:gap-4 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center sm:h-10 sm:w-10">
                <img src={logo} alt="Hyperloop UPV" className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <div>
                <div className="text-lg font-black tracking-tight text-white sm:text-xl lg:text-2xl">
                  HYPERVISOR
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60 sm:text-[10px]">
                  DEMO DASHBOARD
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-[#EDEEF0]/70 lg:hidden">
              <span
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-full",
                  status === "open" && "bg-emerald-400",
                  status === "connecting" && "bg-amber-400 animate-pulse",
                  status === "closed" && "bg-red-500",
                )}
              />
              <span className="font-bold text-white">{uptime}</span>
            </div>
          </div>

          <nav className="no-scrollbar -mx-1 flex h-11 items-stretch gap-2 overflow-x-auto rounded-full border border-white/10 bg-[#1a2035] p-1 lg:mx-0 lg:w-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex h-full shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-center text-[11px] font-bold uppercase leading-none tracking-wider transition-colors sm:px-4 sm:text-sm lg:flex-1",
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

          <div className="hidden items-center gap-3 font-mono text-xs text-[#EDEEF0]/70 lg:flex">
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
            <div>UPTIME</div>
            <div className="font-bold text-white">{uptime}</div>
          </div>
        </div>
      </header>

      <main className="w-full flex-1">
        <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6">{children}</div>
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
