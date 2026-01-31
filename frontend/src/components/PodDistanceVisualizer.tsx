import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { clamp } from "@/lib/demoHelpers"

const getLevitationOffset = (distance: number | null | undefined) => {
  if (typeof distance !== "number") return 50
  return clamp(((distance - 8) / 8) * 100, 8, 90)
}

type PodDistanceVisualizerProps = {
  distance: number | null
  unit: string
  label: string
}

export function PodDistanceVisualizer({ distance, unit, label }: PodDistanceVisualizerProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60">
          Pod Distance Visualizer
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-full sm:w-56 shrink-0">
            <div className="relative h-40 rounded-xl border border-white/10 bg-[#1a2035] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-4 h-3 w-10 rounded-full bg-[#EDEEF0]/60 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
              <div
                className="absolute left-1/2 -translate-x-1/2 h-2 w-12 rounded-full bg-[#FF7F24] shadow-[0_0_12px_rgba(255,127,36,0.7)]"
                style={{
                  bottom: `${getLevitationOffset(distance)}%`,
                }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/40">
              <span>LOW</span>
              <span>HIGH</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-[#FF7F24]">{label}</div>
            <div className="text-xs font-bold uppercase text-white/60">{unit} gap</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
