import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/features/conversations/services/conversationService";
import { toast } from "sonner";

export const conversationKeys = {
  all: ["conversations"] as const,
  list: (params?: { query?: string; status?: "ACTIVE" | "ARCHIVED" }) =>
    ["conversations", "list", params ?? {}] as const,
  detail: (id: string) => ["conversations", "detail", id] as const,
  messages: (id: string) => ["conversations", "messages", id] as const,
};

export function useConversations(params?: { query?: string; status?: "ACTIVE" | "ARCHIVED" }) {
  return useQuery({
    queryKey: conversationKeys.list(params),
    queryFn: () => conversationService.getAll(params),
  });
}

export function useConversation(id: string | undefined) {
  return useQuery({
    queryKey: conversationKeys.detail(id ?? ""),
    queryFn: () => conversationService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) => conversationService.create(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => conversationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      toast.success("Conversa excluída");
    },
    onError: () => toast.error("Não foi possível excluir a conversa", { description: "Tente novamente." }),
  });
}

export function useArchiveConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => conversationService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      toast.success("Conversa arquivada");
    },
    onError: () => toast.error("Não foi possível arquivar a conversa", { description: "Tente novamente." }),
  });
}

export function useUnarchiveConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => conversationService.unarchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      toast.success("Conversa movida para ativas");
    },
  });
}
