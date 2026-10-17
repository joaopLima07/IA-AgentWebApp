import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import { chartColors } from "./chartColors";
import type { AgentUsagePoint } from "@/types";

export function AgentUsageChart({ data }: { data: AgentUsagePoint[] }) {
  const sorted = [...data].sort((a, b) => b.conversations - a.conversations);

  return (
    <ChartCard title="Uso por agente" description="Conversas atendidas por agente, últimos 30 dias">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={chartColors.grid} />
          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chartColors.axis }} />
          <YAxis
            type="category"
            dataKey="agentName"
            tickLine={false}
            axisLine={false}
            width={110}
            tick={{ fontSize: 11, fill: chartColors.axis }}
          />
          <Tooltip content={ChartTooltip} cursor={{ fill: "var(--secondary)" }} />
          <Bar dataKey="conversations" name="Conversas" radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false}>
            {sorted.map((entry) => (
              <Cell key={entry.agentName} fill={chartColors.primary} />
            ))}
            <LabelList dataKey="conversations" position="right" style={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
