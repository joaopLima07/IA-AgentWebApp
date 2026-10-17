import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import { chartColors } from "./chartColors";
import type { TimeSeriesPoint } from "@/types";

export function ConversationsOverTimeChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <ChartCard title="Conversas ao longo do tempo" description="Volume diário de conversas, últimos 14 dias">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="conversationsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.25} />
              <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: chartColors.axis }}
            interval="preserveStartEnd"
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chartColors.axis }} width={32} />
          <Tooltip content={ChartTooltip} cursor={{ stroke: chartColors.grid }} />
          <Area
            isAnimationActive={false}
            type="monotone"
            dataKey="value"
            name="Conversas"
            stroke={chartColors.primary}
            strokeWidth={2}
            fill="url(#conversationsFill)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
