import { useMemo, useState } from "react";
import { Bot, LayoutGrid, Rows3, Search } from "lucide-react";
import { useAgents } from "@/features/agents/hooks/useAgents";
import { AgentCard } from "@/features/agents/components/AgentCard";
import { AgentStatusBadge } from "@/features/agents/components/AgentStatusBadge";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { relativeTime } from "@/lib/date";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function AgentsPage() {
  const { data: agents, isLoading, isError, refetch } = useAgents();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!agents) return [];
    if (!query.trim()) return agents;
    const q = query.toLowerCase();
    return agents.filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }, [agents, query]);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Agentes de IA"
          description="Gerencie os agentes especializados disponíveis para sua organização."
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar agentes"
              className="pl-8"
              aria-label="Pesquisar agentes"
            />
          </div>
          <div className="flex items-center gap-1 self-end rounded-md border border-border p-0.5">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setView("grid")}
              aria-label="Visualização em grade"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setView("table")}
              aria-label="Visualização em tabela"
            >
              <Rows3 className="size-4" />
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className={cn("grid gap-4", view === "grid" && "sm:grid-cols-2 lg:grid-cols-3")}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full" />
            ))}
          </div>
        )}

        {isError && <ErrorState description="Não foi possível carregar os agentes." onRetry={() => refetch()} />}

        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState icon={Bot} title="Nenhum agente encontrado" description="Tente um termo de pesquisa diferente." />
        )}

        {!isLoading && !isError && filtered.length > 0 && view === "grid" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && view === "table" && (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Ferramentas</TableHead>
                  <TableHead>Conhecimento</TableHead>
                  <TableHead>Atualizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((agent) => (
                  <TableRow
                    key={agent.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/agents/${agent.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md text-white", agent.avatarColor)}>
                          <Bot className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{agent.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{agent.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <AgentStatusBadge status={agent.status} />
                    </TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="outline">{agent.provider}</Badge>{" "}
                      <span className="text-xs text-muted-foreground">{agent.model}</span>
                    </TableCell>
                    <TableCell className="text-sm">{agent.toolCount}</TableCell>
                    <TableCell className="text-sm">{agent.documentCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{relativeTime(agent.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
