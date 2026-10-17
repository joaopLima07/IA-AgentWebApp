import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Algo deu errado", description, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-destructive/30 bg-destructive/5 py-16 text-center">
      <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
