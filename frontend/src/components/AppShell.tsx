import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import logo from "@/assets/logo.svg"
interface AppShellProps {
  status: "connecting" | "open" | "closed"
  lastUpdatedAt: number | null
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
  lastUpdatedAt,
  children,
}: AppShellProps) {
  const statusLabel = statusLabelMap[status]
  const lastUpdated =
    lastUpdatedAt !== null ? new Date(lastUpdatedAt).toLocaleTimeString() : "--:--:--"

  return (
    <div className="min-h-dvh w-full bg-[#20274C] text-[#EDEEF0] flex flex-col">
      <header className="w-full border-b border-white/10 bg-[#20274C]">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center">
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

          <nav className="w-full sm:w-auto flex items-stretch gap-2 bg-[#1a2035] p-1 rounded-full border border-white/10 h-11">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex-1 h-full px-3 sm:px-4 py-2 rounded-full text-center text-[11px] sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap leading-none transition-colors flex items-center justify-center",
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

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#EDEEF0]/70">
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
            <div className="hidden sm:block">LAST UPDATE</div>
            <div className="font-bold text-white">{lastUpdated}</div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">{children}</div>
      </main>
    </div>
  )
}
