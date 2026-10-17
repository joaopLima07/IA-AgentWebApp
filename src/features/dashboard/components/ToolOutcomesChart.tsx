import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, XCircle } from "lucide-react";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import { chartColors } from "./chartColors";
import type { ToolCallOutcomePoint } from "@/types";

function Legend() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <CheckCircle2 className="size-3.5" style={{ color: chartColors.success }} />
        Sucesso
      </span>
      <span className="flex items-center gap-1">
        <XCircle className="size-3.5" style={{ color: chartColors.destructive }} />
        Falha
      </span>
    </div>
  );
}

export function ToolOutcomesChart({ data }: { data: ToolCallOutcomePoint[] }) {
  return (
    <ChartCard title="Resultados de chamadas de ferramentas" description="Execuções de ferramentas com sucesso vs. falha, últimos 7 dias" legend={<Legend />}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={2}>
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chartColors.axis }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chartColors.axis }} width={32} />
          <Tooltip content={ChartTooltip} cursor={{ fill: "var(--secondary)" }} />
          <Bar dataKey="success" name="Sucesso" fill={chartColors.success} radius={[3, 3, 0, 0]} maxBarSize={18} isAnimationActive={false} />
          <Bar dataKey="failed" name="Falha" fill={chartColors.destructive} radius={[3, 3, 0, 0]} maxBarSize={18} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
