import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { clamp, formatValue } from "@/lib/demoHelpers"
import { TRACK_LENGTH_M } from "@/lib/telemetrySchema"
import podLight from "@/assets/pod-light.svg"

const TRACK_TICKS = 6 // splits the track into 6 even segments for the rail markers

// Matches the h-16 height set on the <img> below and pod-light.svg's own
// viewBox aspect ratio, so the marker's travel range can be inset by its
// rendered width and never poke outside the track.
const POD_ICON_HEIGHT_PX = 64
const POD_ICON_ASPECT_RATIO = 963.76 / 546.57
const POD_ICON_WIDTH_PX = POD_ICON_HEIGHT_PX * POD_ICON_ASPECT_RATIO

type PodTrackVisualizerProps = {
  positionM: number | null | undefined
}

export function PodTrackVisualizer({ positionM }: PodTrackVisualizerProps) {
  const hasData = typeof positionM === "number" && Number.isFinite(positionM)
  const clamped = hasData ? clamp(positionM, 0, TRACK_LENGTH_M) : 0
  const percent = (clamped / TRACK_LENGTH_M) * 100
  const remaining = hasData ? TRACK_LENGTH_M - clamped : null

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-[#EDEEF0]/60">
          Track Position
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-4">
        <div className="relative h-20 w-full overflow-hidden rounded-xl border border-white/10 bg-[#1a2035] px-4">
          <div className="relative h-full">
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10" />
            <div
              className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#FF7F24]/40 transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
            {Array.from({ length: TRACK_TICKS + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-white/15"
                style={{ left: `${(i / TRACK_TICKS) * 100}%` }}
              />
            ))}
            {/* Positioned by its own left edge (not centered) and inset by its own width, so it
                stays flush inside the track at all times: flush-left at 0%, flush-right at 100%. */}
            <img
              src={podLight}
              alt="Pod"
              className="absolute top-1/2 h-16 w-auto -translate-y-1/2 transition-[left] duration-300 drop-shadow-[0_0_14px_rgba(255,127,36,0.6)]"
              style={{ left: `calc((100% - ${POD_ICON_WIDTH_PX}px) * ${percent / 100})` }}
            />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/40">
          <span>0 m</span>
          <span>{TRACK_LENGTH_M} m</span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <div className="text-3xl font-black text-[#FF7F24]">
              {hasData ? clamped.toFixed(1) : "--"}
              <span className="ml-2 text-xs font-bold text-white/50">m traveled</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-white">
              {hasData ? Math.round(percent) : "--"}
              <span className="ml-1 text-xs font-bold text-white/50">%</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
              {formatValue(remaining)} m left
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
