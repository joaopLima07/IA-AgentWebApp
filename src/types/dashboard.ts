export interface DashboardSummary {
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface AgentUsagePoint {
  agentName: string;
  conversations: number;
}

export interface ToolCallOutcomePoint {
  date: string;
  success: number;
  failed: number;
}

export interface ResponseTimePoint {
  date: string;
  avgSeconds: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  conversationsOverTime: TimeSeriesPoint[];
  agentUsage: AgentUsagePoint[];
  tokenUsage: TimeSeriesPoint[];
  responseTime: ResponseTimePoint[];
}
