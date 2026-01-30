import { useOutletContext } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { TelemetryData } from "../../types/telemetry";

export const BatteriesPage = () => {
  const data = useOutletContext<TelemetryData | null>();
  const hvbms = data?.hvbms ?? [];
  const lvbms = data?.lvbms ? [data.lvbms] : [];
  const systems = [
    ...hvbms.map((system, index) => ({
      ...system,
      label: system.id !== undefined ? `HV BMS ${system.id}` : `HV BMS ${index + 1}`,
    })),
    ...lvbms.map((system) => ({
      ...system,
      label: "LV BMS",
    })),
  ];

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <header className="px-2">
        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
          Battery<span className="text-[#FF7F24]">Monitoring</span>
        </h1>
      </header>

      {systems.map((system, index) => (
          <section key={`${system.label}-${index}`} className="space-y-3">
            {/* System Header - Optimized for narrow screens */}
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black text-white/80 uppercase tracking-widest">
                {system.label}
              </h2>
              <span className="text-[10px] font-mono text-[#FF7F24] uppercase px-2 py-0.5 border border-[#FF7F24]/30 rounded">
                {system.voltage !== undefined ? `${system.voltage}V` : "NO DATA"}
              </span>
            </div>

            {/* Cell Grid: 2 columns on mobile, up to 6 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {system.cells?.map((cell: any, cellIndex: number) => (
                <Card key={`${cell.id ?? cellIndex}`}>
                  <CardHeader className="p-2 pb-0">
                    <CardTitle className="text-[8px] text-white/30 tracking-tighter">
                      {cell.id ?? "CELL"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 pt-1 space-y-1">
                    {cell.voltage !== undefined ? (
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-mono font-black text-[#FF7F24]">
                          {cell.voltage}
                          <span className="text-[9px] ml-0.5 text-white/30 font-bold uppercase">V</span>
                        </span>
                      </div>
                    ) : (
                      <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                        Voltage N/A
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t border-white/5 pt-1 mt-1">
                      <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">Temp</span>
                      <span className={`text-[10px] font-mono font-bold ${
                        typeof cell.temp === "number" && cell.temp > 45 ? "text-red-500 animate-pulse" : "text-white/60"
                      }`}>
                        {cell.temp ?? "--"}°C
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
      ))}

      {systems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">
            No Energy Packs Found
          </p>
        </div>
      )}
    </div>
  );
};
