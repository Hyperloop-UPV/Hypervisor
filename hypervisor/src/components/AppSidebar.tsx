import { Battery, Cpu, Activity, Camera, LayoutDashboard } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import logo from "../assets/logo.svg"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Batteries", url: "/batteries", icon: Battery },
  { title: "Propulsion", url: "/propulsion", icon: Cpu },
  { title: "Levitation", url: "/levitation", icon: Activity },
  { title: "Cameras", url: "/cameras", icon: Camera },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarContent className="pt-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center pb-6 gap-3">
          <div className="p-4 bg-white/5 rounded-full  shadow-xl shadow-black/10">
            <img src={logo} alt="Hyperloop UPV" className="h-12 w-12 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-black tracking-tighter text-white">
              HYPERLOOP<span className="text-[#FF7F24]">UPV</span>
            </h1>
            <p className="text-[10px] font-bold text-[#FF7F24]/80 tracking-[0.2em] uppercase">
              HYPERVISOR
            </p>
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
