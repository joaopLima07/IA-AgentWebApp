import { useState } from "react";
import { ChevronDown, CircleCheck, CircleX, Loader2, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolCall } from "@/types";

const SENSITIVE_KEY_PATTERN = /password|secret|token|ssn|ccnum|creditcard|apikey/i;

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        SENSITIVE_KEY_PATTERN.test(k) ? "••••••••" : redact(v),
      ])
    );
  }
  return value;
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

const statusConfig = {
  RUNNING: {
    icon: Loader2,
    iconClassName: "animate-spin text-primary",
    label: "Em execução",
    badgeClassName: "text-primary",
  },
  SUCCESS: {
    icon: CircleCheck,
    iconClassName: "text-success",
    label: "Concluído",
    badgeClassName: "text-success",
  },
  ERROR: {
    icon: CircleX,
    iconClassName: "text-destructive",
    label: "Falhou",
    badgeClassName: "text-destructive",
  },
} as const;

export function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[toolCall.status];
  const StatusIcon = config.icon;
  const parameters = toolCall.parameters ? (redact(toolCall.parameters) as Record<string, unknown>) : undefined;
  const result = toolCall.result ? redact(toolCall.result) : undefined;

  return (
    <div className="my-1.5 w-full max-w-md overflow-hidden rounded-md border border-border bg-card text-sm shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-secondary/40"
        aria-expanded={expanded}
      >
        <Wrench className="size-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium leading-tight">{toolCall.label}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{toolCall.toolName}</p>
        </div>
        <span className={cn("flex items-center gap-1 text-xs font-medium", config.badgeClassName)}>
          <StatusIcon className={cn("size-3.5", config.iconClassName)} />
          {config.label}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-border bg-secondary/20 px-3 py-3 text-xs">
          {parameters && Object.keys(parameters).length > 0 && (
            <div>
              <p className="mb-1 font-medium uppercase tracking-wide text-muted-foreground">Parâmetros</p>
              <dl className="space-y-0.5 font-mono">
                {Object.entries(parameters).map(([key, value]) => (
                  <div key={key} className="flex gap-1.5">
                    <dt className="text-muted-foreground">{key}:</dt>
                    <dd className="truncate">{formatValue(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {toolCall.status === "SUCCESS" && result !== undefined && (
            <div>
              <p className="mb-1 font-medium uppercase tracking-wide text-muted-foreground">Resultado</p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded bg-secondary/60 p-2 font-mono">
                {formatValue(result)}
              </pre>
            </div>
          )}

          {toolCall.status === "ERROR" && toolCall.errorMessage && (
            <div>
              <p className="mb-1 font-medium uppercase tracking-wide text-destructive">Erro</p>
              <p className="text-destructive">{toolCall.errorMessage}</p>
            </div>
          )}

          {toolCall.executionTimeMs !== undefined && (
            <div>
              <p className="mb-1 font-medium uppercase tracking-wide text-muted-foreground">Tempo de execução</p>
              <p>{(toolCall.executionTimeMs / 1000).toFixed(2)}s</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
