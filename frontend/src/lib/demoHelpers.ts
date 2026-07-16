export const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })

export const formatValue = (value: number | null | undefined) =>
  typeof value === "number" ? value.toFixed(2) : "--"

export const axisTick = { fill: "#EDEEF0", fontSize: 10 }

export const tooltipStyle = {
  background: "#20274C",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const formatState = (value: string | null | undefined) => value ?? "--"

export const formatBoolean = (value: boolean | null | undefined) =>
  value === null || value === undefined ? "--" : value ? "YES" : "NO"
