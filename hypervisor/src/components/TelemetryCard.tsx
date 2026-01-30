import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TelemetryCardProps {
  data: any;
  color?: "blue" | "purple" | "green" | "orange";
}

export function TelemetryCard({ data, color = "blue" }: TelemetryCardProps) {
  return (
    <Card variant="telemetry" accent={color}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-slate-400">
          {data.label || data.id}
        </CardTitle>
        <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300 animate-pulse">
          LIVE
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-white tabular-nums">
            {typeof data.value === 'number' ? data.value.toFixed(2) : data.value}
          </span>
          <span className="text-sm font-medium text-slate-500">{data.unit}</span>
        </div>
        {data.stability && (
          <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-current transition-all duration-500" 
              style={{ width: `${data.stability}%`, color: 'inherit' }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
