import { Badge } from "@/components/ui/badge";
import type { AgentStatus } from "@/types";

const config: Record<AgentStatus, { label: string; variant: "success" | "secondary" | "warning" }> = {
  ACTIVE: { label: "Ativo", variant: "success" },
  PAUSED: { label: "Pausado", variant: "secondary" },
  DRAFT: { label: "Rascunho", variant: "warning" },
};

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  const { label, variant } = config[status];
  return (
    <Badge variant={variant} className="gap-1.5">
      <span
        className={`size-1.5 rounded-full ${
          status === "ACTIVE" ? "bg-success" : status === "DRAFT" ? "bg-warning" : "bg-muted-foreground"
        }`}
      />
      {label}
    </Badge>
  );
}
