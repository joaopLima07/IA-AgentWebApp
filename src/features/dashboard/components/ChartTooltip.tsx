import type { TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

export function ChartTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-popover-foreground">{label}</p>}
      <div className="space-y-0.5">
        {payload.map((entry, index) => (
          <div key={`${entry.dataKey ?? index}`} className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium tabular-nums text-popover-foreground">
              {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
