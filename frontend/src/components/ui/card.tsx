import * as React from "react"
import { cn } from "@/lib/utils"

type CardVariant = "default" | "telemetry" | "light"
type CardAccent = "blue" | "purple" | "green" | "orange"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: CardVariant
    accent?: CardAccent
  }
>(({ className, variant = "default", accent, ...props }, ref) => {
  const variantClasses =
    variant === "telemetry"
      ? "bg-slate-950/50 border-slate-800 backdrop-blur-md transition-all duration-300 hover:scale-[1.02]"
      : variant === "light"
        ? "bg-[#EDEEF0] border-white/10 text-[#20274C] transition-all duration-200"
        : "bg-[#20274C]/40 border-white/5 backdrop-blur-md transition-all duration-200 active:scale-[0.98] active:bg-[#20274C]/60"

  const accentClasses = accent
    ? cn(
        "border-l-4",
        accent === "blue" && "border-l-blue-500 shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)]",
        accent === "purple" && "border-l-purple-500 shadow-[0_0_15px_-5px_rgba(168,85,247,0.5)]",
        accent === "green" && "border-l-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.5)]",
        accent === "orange" && "border-l-orange-500 shadow-[0_0_15px_-5px_rgba(249,115,22,0.5)]",
      )
    : ""

  return (
    <div
      ref={ref}
      className={cn(
        // Style: Navy Glass + White Border + Shadow
        "relative overflow-hidden rounded-xl border text-slate-50 shadow-lg",
        variantClasses,
        accentClasses,
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1 p-3", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-[10px] font-bold uppercase tracking-widest text-white/40", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-3 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
