import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { agentService } from "@/features/agents/services/agentService";
import type { Agent } from "@/types";
import { ApiRequestError } from "@/types/api";
import { toast } from "sonner";

export const agentKeys = {
  all: ["agents"] as const,
  detail: (id: string) => ["agents", "detail", id] as const,
};

export function useAgents() {
  return useQuery({ queryKey: agentKeys.all, queryFn: () => agentService.getAll() });
}

export function useAgent(id: string | undefined) {
  return useQuery({
    queryKey: agentKeys.detail(id ?? ""),
    queryFn: () => agentService.getById(id!),
    enabled: !!id,
  });
}

export function useUpdateAgent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agent: Agent) => agentService.update(id, agent),
    onSuccess: (updated) => {
      queryClient.setQueryData(agentKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
      toast.success("Agente atualizado");
    },
    onError: (error) =>
      toast.error("Não foi possível salvar as alterações", {
        description: error instanceof ApiRequestError && error.status === 409 ? error.message : "Tente novamente.",
      }),
  });
}
