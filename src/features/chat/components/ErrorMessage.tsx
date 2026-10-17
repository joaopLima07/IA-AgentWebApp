import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MessageError } from "@/types";

interface ErrorMessageProps {
  error: MessageError;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-destructive">Algo deu errado</p>
        <p className="mt-0.5 text-muted-foreground">{error.message}</p>
        {error.retryable && onRetry && (
          <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={onRetry}>
            <RotateCw className="size-3.5" />
            Tentar novamente
          </Button>
        )}
      </div>
    </div>
  );
}
