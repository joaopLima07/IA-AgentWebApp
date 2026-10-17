import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bot, FileText, Save } from "lucide-react";
import { useAgent, useUpdateAgent } from "@/features/agents/hooks/useAgents";
import { PageLoader } from "@/components/common/PageLoader";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgentStatusBadge } from "@/features/agents/components/AgentStatusBadge";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Agent, AgentStatus } from "@/types";

const MODEL_OPTIONS: Record<Agent["provider"], string[]> = {
  OpenAI: ["GPT-4.1", "GPT-4.1 mini", "GPT-4o"],
  Anthropic: ["Claude Sonnet 4.5", "Claude Opus 4.5", "Claude Haiku 4.5"],
  Gemini: ["Gemini 2.5 Pro", "Gemini 2.5 Flash"],
};

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { data: agent, isLoading, isError, refetch } = useAgent(agentId);
  const updateAgent = useUpdateAgent(agentId ?? "");

  const [draft, setDraft] = useState<Agent | null>(null);

  useEffect(() => {
    if (agent) setDraft(agent);
  }, [agent]);

  if (isLoading || !draft) return <PageLoader />;
  if (isError || !agent) return <ErrorState description="Não foi possível carregar este agente." onRetry={() => refetch()} />;

  const providerModels = MODEL_OPTIONS[draft.provider] ?? [];
  const modelOptions = providerModels.includes(draft.model) ? providerModels : [draft.model, ...providerModels];

  const isDirty = JSON.stringify(draft) !== JSON.stringify(agent);

  const handleSave = () => {
    updateAgent.mutate(draft);
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5 text-muted-foreground" onClick={() => navigate("/agents")}>
          <ArrowLeft className="size-4" />
          Voltar para agentes
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg text-white", draft.avatarColor)}>
              <Bot className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight">{draft.name}</h1>
                <AgentStatusBadge status={draft.status} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{draft.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">Última atualização em {formatDate(draft.updatedAt)}</p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={!isDirty || updateAgent.isPending} className="shrink-0 gap-1.5">
            <Save className="size-4" />
            {updateAgent.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>

        <Tabs defaultValue="information" className="mt-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="information">Informações</TabsTrigger>
            <TabsTrigger value="model">Modelo</TabsTrigger>
            <TabsTrigger value="instructions">Instruções</TabsTrigger>
            <TabsTrigger value="tools">Ferramentas</TabsTrigger>
            <TabsTrigger value="knowledge">Conhecimento</TabsTrigger>
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
          </TabsList>

          <TabsContent value="information" className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="agent-name">Nome do agente</Label>
              <Input id="agent-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agent-desc">Descrição</Label>
              <Textarea
                id="agent-desc"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid max-w-xs gap-2">
              <Label htmlFor="agent-status">Status</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as AgentStatus })}>
                <SelectTrigger id="agent-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="PAUSED">Pausado</SelectItem>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="model" className="space-y-5">
            <div className="grid max-w-xs gap-2">
              <Label>Provedor</Label>
              <Select
                value={draft.provider}
                onValueChange={(v) =>
                  setDraft({ ...draft, provider: v as Agent["provider"], model: MODEL_OPTIONS[v as Agent["provider"]][0] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OpenAI">OpenAI</SelectItem>
                  <SelectItem value="Anthropic">Anthropic</SelectItem>
                  <SelectItem value="Gemini">Gemini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid max-w-xs gap-2">
              <Label>Modelo</Label>
              <Select value={draft.model} onValueChange={(v) => setDraft({ ...draft, model: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid max-w-xs gap-2">
              <Label htmlFor="agent-temp">Temperatura</Label>
              <Input
                id="agent-temp"
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={draft.temperature}
                onChange={(e) => setDraft({ ...draft, temperature: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Valores mais baixos produzem respostas mais consistentes e determinísticas.</p>
            </div>
            <div className="grid max-w-xs gap-2">
              <Label htmlFor="agent-tokens">Máximo de tokens</Label>
              <Input
                id="agent-tokens"
                type="number"
                step={256}
                value={draft.maxTokens}
                onChange={(e) => setDraft({ ...draft, maxTokens: Number(e.target.value) })}
              />
            </div>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-3">
            <Label htmlFor="agent-instructions">Instruções do sistema</Label>
            <Textarea
              id="agent-instructions"
              value={draft.instructions}
              onChange={(e) => setDraft({ ...draft, instructions: e.target.value })}
              rows={10}
              className="font-mono text-xs leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">
              Essas instruções definem o comportamento, o tom e os limites do agente. As alterações se aplicam somente a novas conversas.
            </p>
          </TabsContent>

          <TabsContent value="tools" className="space-y-3">
            {draft.tools.map((tool) => (
              <div key={tool.id} className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-medium">{tool.name}</p>
                    <Badge variant="outline">{tool.category}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
                </div>
                <Switch
                  checked={tool.enabled}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      tools: draft.tools.map((t) => (t.id === tool.id ? { ...t, enabled: checked } : t)),
                    })
                  }
                  aria-label={`Ativar ou desativar ${tool.name}`}
                />
              </div>
            ))}
            {draft.tools.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma ferramenta configurada.</p>}
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-3">
            {draft.knowledgeSources.map((source) => (
              <div key={source.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-2.5">
                  <FileText className="size-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{source.name}</p>
                </div>
                <span className="text-xs text-muted-foreground">{source.documentCount} documentos</span>
              </div>
            ))}
            {draft.knowledgeSources.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma fonte de conhecimento vinculada a este agente.</p>
            )}
            <Separator />
            <p className="text-xs text-muted-foreground">
              Gerencie os documentos subjacentes na página <span className="font-medium text-foreground">Base de Conhecimento</span>.
            </p>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-3">
            {draft.permissions.map((perm) => (
              <div key={perm.id} className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium">{perm.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{perm.description}</p>
                </div>
                <Switch
                  checked={perm.granted}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      permissions: draft.permissions.map((p) => (p.id === perm.id ? { ...p, granted: checked } : p)),
                    })
                  }
                  aria-label={`Ativar ou desativar ${perm.label}`}
                />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
