import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { agentService } from "@/features/agents/services/agentService";
import { apiClient } from "@/services/api";
import { API_CONFIG } from "@/services/config";
import type { AgentUsagePoint, DashboardData, ResponseTimePoint, TimeSeriesPoint } from "@/types";

/**
 * Dashboard service backed by the Spring Boot `/api/panel` endpoints. Each
 * endpoint returns one metric for all conversations; the dates are ISO
 * `yyyy-MM-dd` strings (LocalDate).
 */

const panelApi = { baseUrl: API_CONFIG.panelBaseUrl };

const TOKEN_DAYS = 14;
const RESPONSE_TIME_DAYS = 7;

interface CardsResponse {
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
}

interface DailyTokensResponse {
  date: string;
  totalTokens: number;
}

interface ConversationsCreatedResponse {
  date: string;
  quantityConversations: number;
}

interface AgentUsageResponse {
  date: string;
  agentId: number;
  totalUsage: number;
}

interface ResponseTimeResponse {
  date: string;
  latencyMs: number;
}

const formatDay = (isoDate: string) => format(parseISO(isoDate), "MMM d", { locale: ptBR });

/** The backend returns one row per agent and day; the chart wants one bar per agent. */
function toAgentUsage(rows: AgentUsageResponse[], agentNames: Map<number, string>): AgentUsagePoint[] {
  const totals = new Map<number, number>();
  for (const row of rows) {
    totals.set(row.agentId, (totals.get(row.agentId) ?? 0) + row.totalUsage);
  }
  return [...totals.entries()].map(([agentId, conversations]) => ({
    agentName: agentNames.get(agentId) ?? `Agente ${agentId}`,
    conversations,
  }));
}

export const dashboardService = {
  async getData(): Promise<DashboardData> {
    const [cards, dailyTokens, conversationsCreated, agentUsage, responseTime, agents] = await Promise.all([
      apiClient.get<CardsResponse>("/cards", panelApi),
      apiClient.get<DailyTokensResponse[]>("/dailyTokens", panelApi),
      apiClient.get<ConversationsCreatedResponse[]>("/conversationsCreated", panelApi),
      apiClient.get<AgentUsageResponse[]>("/agentUsage", panelApi),
      apiClient.get<ResponseTimeResponse[]>("/responseTime", panelApi),
      // names are a nicety: the charts still work (as "Agente N") if the agent list fails
      agentService.getAll().catch(() => []),
    ]);

    const agentNames = new Map(agents.map((a) => [Number(a.id), a.name]));

    const tokenUsage: TimeSeriesPoint[] = dailyTokens
      .slice(-TOKEN_DAYS)
      .map((d) => ({ date: formatDay(d.date), value: d.totalTokens }));

    const conversationsOverTime: TimeSeriesPoint[] = conversationsCreated.map((c) => ({
      date: formatDay(c.date),
      value: c.quantityConversations,
    }));

    const responseTimePoints: ResponseTimePoint[] = responseTime
      .slice(-RESPONSE_TIME_DAYS)
      .map((r) => ({ date: formatDay(r.date), avgSeconds: Number((r.latencyMs / 1000).toFixed(2)) }));

    return {
      summary: {
        totalConversations: cards.totalConversations,
        totalMessages: cards.totalMessages,
        totalTokens: cards.totalTokens,
      },
      conversationsOverTime,
      agentUsage: toAgentUsage(agentUsage, agentNames),
      tokenUsage,
      responseTime: responseTimePoints,
    };
  },
};
