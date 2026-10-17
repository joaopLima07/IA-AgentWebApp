import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/types";

const config: Record<DocumentStatus, { label: string; variant: "success" | "warning" | "destructive" }> = {
  PROCESSED: { label: "Processado", variant: "success" },
  PROCESSING: { label: "Processando", variant: "warning" },
  ERROR: { label: "Erro", variant: "destructive" },
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const { label, variant } = config[status];
  return (
    <Badge variant={variant} className="gap-1.5">
      {status === "PROCESSING" && <Loader2 className="size-3 animate-spin" />}
      {label}
    </Badge>
  );
}
