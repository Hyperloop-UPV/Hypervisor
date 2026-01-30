import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"
import logo from "../../assets/logo.svg"

// --- Context ---

interface SidebarContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider")
  return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  
  // Memoize value to prevent unnecessary re-renders
  const value = React.useMemo(() => ({ open, setOpen }), [open])

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

// --- Components ---

export function Sidebar({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useSidebar()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#20274C]/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={() => setOpen(false)}
      />
      
      
      <aside
        className={cn(
          "relative z-50 w-full max-w-sm rounded-2xl shadow-2xl transition-all duration-300 animate-in zoom-in-95",
          "bg-[#20274C]/90 backdrop-blur-xl  border-white/10 text-white",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        
        {children}
      </aside>
    </div>
  )
}

export function SidebarContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col overflow-y-auto p-6 gap-6", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarGroup({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarGroupLabel({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-2 text-xs font-bold uppercase tracking-widest text-[#FF7F24]/80", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarGroupContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarMenu({ children, className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn("flex flex-col gap-1 list-none p-0 m-0", className)} {...props}>
      {children}
    </ul>
  )
}

export function SidebarMenuItem({ children, className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn("list-none", className)} {...props}>
      {children}
    </li>
  )
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  isActive?: boolean
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, asChild = false, isActive = false, children, onClick, ...props }, ref) => {
    const { setOpen } = useSidebar()
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          setOpen(false)
          onClick?.(e)
        }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 w-full text-left",
          isActive
            ? "bg-[#FF7F24] text-white shadow-sm shadow-[#FF7F24]/20" // Active: Brand Orange
            : "text-[#EDEEF0] hover:bg-white/10 hover:text-white",    // Inactive: Light Gray -> White
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// --- Trigger Button ---

export function SidebarTrigger() {
  const { open, setOpen } = useSidebar()
  
  return (
    <button
      onClick={() => setOpen(!open)}
      className={cn(
        "fixed bottom-6 right-6 z-[60] p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95",
        "bg-[#20274C] border border-white/10 hover:bg-[#2a325a]"
      )}
      aria-label="Toggle navigation menu"
    >
      {open ? (
        <X className="h-6 w-6 text-[#FF7F24]" />
      ) : (
        // Ensure logo is white or has a background if it's black
        <img src={logo} alt="Logo" className="h-6 w-6" />
      )}
    </button>
  )
}
