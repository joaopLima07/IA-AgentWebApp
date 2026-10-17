export interface DashboardSummary {
  totalConversations: number;
  conversationsDelta: number;
  totalMessages: number;
  messagesDelta: number;
  resolutionRate: number;
  resolutionDelta: number;
  totalTokens: number;
  tokensDelta: number;
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
  toolOutcomes: ToolCallOutcomePoint[];
  tokenUsage: TimeSeriesPoint[];
  responseTime: ResponseTimePoint[];
}
