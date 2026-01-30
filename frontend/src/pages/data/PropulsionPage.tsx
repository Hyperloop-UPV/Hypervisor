import { useOutletContext } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { TelemetryData } from "../../types/telemetry";

export const PropulsionPage = () => {
  const data = useOutletContext<TelemetryData | null>();
  const propulsion = data?.propulsion ?? {};

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <header className="px-2">
        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
          Propulsion <span className="text-[#FF7F24]"></span>
        </h1>
        <div className="h-1 w-12 bg-[#FF7F24] mt-1" />
      </header>
      
      {/* Stacked on mobile (1 col), side-by-side on desktop (2 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-[10px] tracking-[0.2em]">SPEED</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-mono font-black text-[#FF7F24] tracking-tighter leading-none">
                {propulsion.speed ?? 0}
              </span>
              <span className="text-xs font-bold text-white/40 uppercase mt-1">
                KM/H — Output Level
              </span>
            </div>
            
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF7F24] shadow-[0_0_15px_rgba(255,127,36,0.5)] transition-all duration-700" 
                style={{ width: `${Math.min(((propulsion.speed ?? 0) / 600) * 100, 100)}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-[10px] tracking-[0.2em]">STATUS</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/40 uppercase">Acceleration</span>
              <span className={`text-xs font-bold uppercase ${propulsion.acceleration ? "text-emerald-400" : "text-white/40"}`}>
                {propulsion.acceleration ? "ON" : "OFF"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/40 uppercase">Braking</span>
              <span className={`text-xs font-bold uppercase ${propulsion.braking ? "text-red-400" : "text-white/40"}`}>
                {propulsion.braking ? "ENGAGED" : "IDLE"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
