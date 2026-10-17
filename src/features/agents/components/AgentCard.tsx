import { Link } from "react-router-dom";
import { Bot, FileText, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentStatusBadge } from "./AgentStatusBadge";
import { relativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link to={`/agents/${agent.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
      <Card className="h-full transition-colors hover:border-primary/40 hover:shadow-md">
        <div className="flex items-start gap-3 p-5 pb-3">
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg text-white", agent.avatarColor)}>
            <Bot className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-semibold">{agent.name}</h3>
            </div>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{agent.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 px-5 pb-3">
          <AgentStatusBadge status={agent.status} />
          <Badge variant="outline">{agent.provider}</Badge>
          <Badge variant="outline">{agent.model}</Badge>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Wrench className="size-3.5" />
              {agent.toolCount} ferramentas
            </span>
            <span className="flex items-center gap-1">
              <FileText className="size-3.5" />
              {agent.documentCount} documentos
            </span>
          </div>
          <span>Atualizado {relativeTime(agent.updatedAt)}</span>
        </div>
      </Card>
    </Link>
  );
}
