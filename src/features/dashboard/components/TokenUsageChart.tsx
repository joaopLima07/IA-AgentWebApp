import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import { chartColors } from "./chartColors";
import { formatCompactNumber } from "@/lib/format";
import type { TimeSeriesPoint } from "@/types";

export function TokenUsageChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <ChartCard title="Uso de tokens" description="Total de tokens consumidos por dia, últimos 14 dias">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chartColors.axis }} interval="preserveStartEnd" />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: chartColors.axis }}
            width={42}
            tickFormatter={(v) => formatCompactNumber(v)}
          />
          <Tooltip content={ChartTooltip} cursor={{ stroke: chartColors.grid }} />
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="value"
            name="Tokens"
            stroke={chartColors.primary}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
