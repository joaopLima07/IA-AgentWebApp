import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import { chartColors } from "./chartColors";
import type { ResponseTimePoint } from "@/types";

export function ResponseTimeChart({ data }: { data: ResponseTimePoint[] }) {
  return (
    <ChartCard title="Tempo de resposta da IA" description="Tempo médio até a primeira resposta, últimos 7 dias">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chartColors.axis }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: chartColors.axis }}
            width={36}
            tickFormatter={(v) => `${v}s`}
          />
          <Tooltip content={ChartTooltip} cursor={{ stroke: chartColors.grid }} />
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="avgSeconds"
            name="Tempo médio de resposta (s)"
            stroke={chartColors.primary}
            strokeWidth={2}
            dot={{ r: 3, fill: chartColors.primary, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
