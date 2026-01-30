import { Link, useOutletContext } from "react-router-dom";
import { 
  Battery, Cpu, Activity, Camera, ArrowRight, CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TelemetryData } from "../../types/telemetry";

const SystemCard = ({ system }: { system: any }) => (
  <Link 
    to={system.url}
    className={cn(
      "group relative flex flex-col justify-between p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 overflow-hidden",
      "bg-[#2a325a]/40 hover:bg-[#2a325a]/60 hover:scale-[1.02] hover:shadow-2xl",
      system.border
    )}
  >
    {/* Hover Glow Effect */}
    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br from-transparent via-transparent", system.color.replace('text-', 'to-'))} />

    <div className="flex items-start justify-between z-10">
      <div className={cn("p-3 rounded-xl border border-white/5", system.bg)}>
        <system.icon className={cn("h-6 w-6", system.color)} />
      </div>
      <div className={cn("px-2 py-1 rounded-full text-[10px] font-bold border border-white/5 bg-black/20 backdrop-blur-sm", system.color)}>
        {system.status}
      </div>
    </div>

    <div className="mt-8 z-10">
      <h3 className="text-2xl font-black text-white tracking-tight mb-1">{system.title}</h3>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{system.metricLabel}</div>
          <div className={cn("text-xl font-mono font-bold", system.color)}>{system.metric}</div>
        </div>
        <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  </Link>
);

export const Dashboard = () => {
  const data = useOutletContext<TelemetryData>();

  const systems = [
    { 
      title: "Batteries", 
      url: "/batteries", 
      icon: Battery,
      status: data?.hvbms ? "NOMINAL" : "OFFLINE",
      metric: data?.hvbms ? `${data.hvbms[0]?.voltage.toFixed(0)}V` : "--",
      metricLabel: "MAIN VOLTAGE",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    { 
      title: "Propulsion", 
      url: "/propulsion", 
      icon: Cpu,
      status: data?.propulsion?.status || "STANDBY",
      metric: `${data?.propulsion?.speed ?? 0} km/h`,
      metricLabel: "VELOCITY",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    { 
      title: "Levitation", 
      url: "/levitation", 
      icon: Activity,
      status: "ACTIVE",
      metric: `${data?.levitation?.verticalGap ?? 0} mm`,
      metricLabel: "AIR GAP",
      color: "text-[#FF7F24]",
      bg: "bg-[#FF7F24]/10",
      border: "border-[#FF7F24]/20"
    },
    { 
      title: "Cameras", 
      url: "/cameras", 
      icon: Camera,
      status: "RECORDING",
      metric: "4 FEEDS",
      metricLabel: "LIVE STREAM",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
  ];

  return (
    <div className="min-h-full w-full flex flex-col relative">
      
      <div className="flex-1 flex flex-col p-6 sm:p-10 z-10 max-w-7xl mx-auto w-full pt-16">
        
        {/* Simplified Header */}
        <header className="mb-12 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-xs font-bold text-emerald-400 tracking-[0.2em] uppercase">Hypervisor Connected</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-white">
              HYPER<span className="text-[#FF7F24]">VISOR</span>
            </h1>
          </div>
        </header>

        {/* System Launchpad Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systems.map((system) => (
            <SystemCard key={system.title} system={system} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-12 flex items-center justify-between text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
          </div>
          <div>HYPERLOOP UPV // TELEMETRY</div>
        </div>
      </div>
    </div>
  );
};
