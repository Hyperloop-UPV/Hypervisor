import { useState } from "react";
import { useOutletContext } from 'react-router-dom';
import { 
  Camera, 
  Maximize2, 
  MoreVertical, 
  Circle, 
  Wifi, 
  WifiOff, 
  Aperture,
  Video,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TelemetryData } from '../../types/telemetry';

// --- Types ---

interface CameraFeedProps {
  id: string;
  label: string;
  src?: string; // In a real app, this would be your MJPEG stream URL
  status: 'ONLINE' | 'OFFLINE' | 'CONNECTING';
}

// --- Components ---

const CameraFeed = ({ id, label, src, status: initialStatus }: CameraFeedProps) => {
  const [status, setStatus] = useState(initialStatus);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle for demo purposes
  const toggleConnection = () => {
    setStatus(prev => prev === 'ONLINE' ? 'OFFLINE' : 'ONLINE');
  };

  return (
    <div className={cn(
      "relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 group",
      status === 'ONLINE' ? "bg-black border-[#FF7F24]/50 shadow-2xl" : "bg-[#1a2035] border-white/10",
      isFullscreen ? "fixed inset-0 z-[100] m-0 rounded-none" : "h-[400px] w-full"
    )}>
      
      {/* HEADER BAR (Overlay) */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className={cn("px-2 py-1 rounded bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-2")}>
            <div className={cn("h-2 w-2 rounded-full animate-pulse", status === 'ONLINE' ? "bg-emerald-500" : "bg-red-500")} />
            <span className="text-[10px] font-mono font-bold text-white tracking-widest">{label}</span>
          </div>
          {status === 'ONLINE' && (
            <div className="px-2 py-1 rounded bg-red-500/20 border border-red-500/30 flex items-center gap-2">
               <Circle size={8} className="fill-red-500 text-red-500 animate-pulse" />
               <span className="text-[10px] font-bold text-red-400 tracking-widest">REC</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
           <button 
             onClick={toggleConnection}
             className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
             title="Simulate Connection Toggle"
           >
             {status === 'ONLINE' ? <Wifi size={18} /> : <WifiOff size={18} />}
           </button>
           <button 
             onClick={() => setIsFullscreen(!isFullscreen)}
             className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
           >
             <Maximize2 size={18} />
           </button>
        </div>
      </div>

      {/* VIDEO AREA */}
      <div className="flex-1 relative flex items-center justify-center bg-[#0f1219]">
        {status === 'ONLINE' ? (
            // LIVE FEED PLACEHOLDER (Use an <img> tag with your MJPEG stream URL here)
            <div className="relative w-full h-full">
              {/* Fake video noise/gradient for demo */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-50" />
              
              {/* Tactical Crosshair Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                 <div className="w-12 h-12 border-2 border-white/50 rounded-full" />
                 <div className="absolute w-full h-[1px] bg-white/20" />
                 <div className="absolute h-full w-[1px] bg-white/20" />
              </div>

              {/* Simulated Image Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-white/10 font-black text-6xl uppercase tracking-tighter rotate-[-15deg] select-none">
                   Live Feed
                 </span>
              </div>
            </div>
        ) : (
            // OFFLINE STATE
            <div className="flex flex-col items-center gap-4 opacity-50">
               <WifiOff size={48} className="text-slate-500" />
               <span className="text-sm font-mono text-slate-500 uppercase tracking-widest">Signal Lost</span>
            </div>
        )}
      </div>

      {/* FOOTER BAR (Telemetry Overlay) */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent z-20 flex justify-between items-end font-mono text-xs">
         <div className="space-y-1 text-slate-400">
            <div className="flex gap-4">
              <span>ISO: <span className="text-white">800</span></span>
              <span>IRIS: <span className="text-white">f/2.8</span></span>
              <span>WB: <span className="text-white">5600K</span></span>
            </div>
            <div className="text-[10px] opacity-60">1920x1080 @ 60fps • 12Mbps</div>
         </div>
         <div className="text-right text-[#FF7F24]">
            {status === 'ONLINE' ? "LINK ESTABLISHED" : "SEARCHING..."}
         </div>
      </div>

    </div>
  );
};

export const CamerasPage = () => {
  const context = useOutletContext<TelemetryData>();

  return (
    <div className="min-h-dvh w-full flex flex-col">

      {/* Header */}
      <header className="p-4 sm:p-6 pb-2 shrink-0 flex justify-between items-end">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-8 w-1 sm:h-12 bg-[#FF7F24] rounded-full shrink-0" /> 
          <div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-white">
              VISION<span className="text-[#FF7F24]">SYSTEMS</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-400 tracking-wide">
              OPTICAL NAVIGATION & MONITORING
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="hidden sm:flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a325a]/50 border border-white/10 hover:bg-[#2a325a] transition-all text-xs font-bold uppercase tracking-wider">
              <Settings size={14} /> Configure
           </button>
           <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF7F24] text-white hover:bg-[#ff8f40] transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20">
              <Video size={14} /> Record All
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 pt-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
           {/* Camera 1: Forward View */}
           <CameraFeed 
             id="cam_01" 
             label="CAM 01 // FORWARD GUIDE" 
             status="ONLINE"
           />

           {/* Camera 2: Payload/Rear View */}
           <CameraFeed 
             id="cam_02" 
             label="CAM 02 // PAYLOAD BAY" 
             status="OFFLINE" // Defaulting to offline to show state difference
           />
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-6 p-4 rounded-xl bg-[#2a325a]/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <Aperture className="text-[#FF7F24]" />
              <div className="text-xs font-mono text-slate-400">
                <span className="text-white font-bold block">VISION PROCESSOR</span>
                <span>NEURAL ENGINE ACTIVE</span>
              </div>
           </div>
           
           <div className="flex gap-8 text-xs font-mono text-slate-500">
              <div>LATENCY: <span className="text-emerald-400">24ms</span></div>
              <div>BANDWIDTH: <span className="text-white">24.5 MB/s</span></div>
              <div>STORAGE: <span className="text-white">128 GB FREE</span></div>
           </div>
        </div>

      </main>
    </div>
  );
};
