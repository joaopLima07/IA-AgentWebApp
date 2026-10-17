import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string;
  delta: number;
  icon: LucideIcon;
}

export function StatTile({ label, value, delta, icon: Icon }: StatTileProps) {
  const isPositive = delta >= 0;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p
        className={cn(
          "mt-1.5 flex items-center gap-1 text-xs font-medium",
          isPositive ? "text-success" : "text-destructive"
        )}
      >
        {isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
        {Math.abs(delta).toFixed(1)}%
        <span className="font-normal text-muted-foreground">vs. período anterior</span>
      </p>
    </Card>
  );
}
