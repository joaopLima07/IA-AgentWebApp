import { MessageSquare, MessagesSquare, Coins } from "lucide-react";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboard";
import { StatTile } from "@/features/dashboard/components/StatTile";
import { ConversationsOverTimeChart } from "@/features/dashboard/components/ConversationsOverTimeChart";
import { AgentUsageChart } from "@/features/dashboard/components/AgentUsageChart";
import { TokenUsageChart } from "@/features/dashboard/components/TokenUsageChart";
import { ResponseTimeChart } from "@/features/dashboard/components/ResponseTimeChart";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactNumber, formatNumber } from "@/lib/format";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardData();

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Painel" description="Desempenho da plataforma em todos os agentes e conversas." />

        {isError && <ErrorState description="Não foi possível carregar as métricas do painel." onRetry={() => refetch()} />}

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatTile label="Conversas" value={formatNumber(data.summary.totalConversations)} icon={MessageSquare} />
              <StatTile label="Mensagens" value={formatNumber(data.summary.totalMessages)} icon={MessagesSquare} />
              <StatTile label="Tokens usados" value={formatCompactNumber(data.summary.totalTokens)} icon={Coins} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <ConversationsOverTimeChart data={data.conversationsOverTime} />
              <AgentUsageChart data={data.agentUsage} />
              <TokenUsageChart data={data.tokenUsage} />
              <ResponseTimeChart data={data.responseTime} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
