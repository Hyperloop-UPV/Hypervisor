import { useOutletContext } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { TelemetryData } from "../../types/telemetry";

export const LevitationPage = () => {
  const data = useOutletContext<TelemetryData | null>();
  const levitation = data?.levitation ?? {};
  const metrics = [
    { key: "verticalGap", label: "Vertical Gap", unit: "mm" },
    { key: "lateralOffset", label: "Lateral Offset", unit: "mm" },
    { key: "verticalAccel", label: "Vertical Accel", unit: "m/s²" },
    { key: "lateralAccel", label: "Lateral Accel", unit: "m/s²" },
    { key: "magnetTemp", label: "Magnet Temp", unit: "°C" },
  ];
  const hasMetrics = metrics.some(metric => levitation?.[metric.key] !== undefined);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <header className="px-2">
        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
          Levitation 
        </h1>
      </header>
      
      {/* 2 columns on mobile so more fit on screen, 3+ on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {metrics.map((metric) => (
          <Card key={metric.key}>
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-[9px] tracking-widest">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono font-black text-[#FF7F24]">
                  {levitation?.[metric.key] ?? "--"}
                </span>
                <span className="text-[10px] font-bold text-white/30 uppercase">
                  {metric.unit}
                </span>
              </div>
              
              <div className="mt-2 h-1 w-full bg-white/5 rounded-full">
                <div 
                  className="h-full bg-[#FF7F24]/60" 
                  style={{ width: `${levitation?.stability ?? 100}%` }} 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!hasMetrics && (
        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 animate-pulse">
            Scanning for magnetic link...
          </p>
        </div>
      )}
    </div>
  );
};
