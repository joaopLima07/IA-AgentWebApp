import { useLayoutEffect, useRef } from "react";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { parseDescription } from "@/features/agents/lib/description";

const MAX_HEIGHT_PX = 320;

interface AgentAboutCardProps {
  value: string;
  onChange: (value: string) => void;
  canEdit: boolean;
}

export function AgentAboutCard({ value, onChange, canEdit }: AgentAboutCardProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grow with the content so long descriptions are fully visible without scrolling.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.ceil(el.scrollHeight) + 1;
    el.style.height = `${Math.min(next, MAX_HEIGHT_PX)}px`;
    el.style.overflowY = next > MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [value, canEdit]);

  const { summary, usage } = parseDescription(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sobre o agente</CardTitle>
        <CardDescription>
          A plataforma lê esta descrição para decidir qual agente responde a cada pergunta. Explique o que ele faz e,
          se quiser, escreva <span className="font-medium text-foreground">Como usar:</span> seguido de exemplos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canEdit ? (
          <Textarea
            ref={ref}
            id="agent-desc"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="scrollbar-thin min-h-28 resize-none text-sm leading-relaxed"
            aria-label="Descrição do agente"
          />
        ) : (
          <div className="space-y-4 text-sm leading-relaxed">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">O que faz</p>
              <p>{summary || "Sem descrição."}</p>
            </div>
            {usage && (
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Lightbulb className="size-3.5" />
                  Como usar
                </p>
                <p>{usage}</p>
              </div>
            )}
          </div>
        )}
        {canEdit && (
          <p className="mt-2 text-right text-xs tabular-nums text-muted-foreground">{value.length} caracteres</p>
        )}
      </CardContent>
    </Card>
  );
}
