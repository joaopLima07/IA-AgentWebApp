import { useNavigate } from "react-router-dom";
import { Archive, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useArchiveConversation, useDeleteConversation } from "@/features/conversations/hooks/useConversations";
import type { Conversation } from "@/types";

export function ChatHeader({ conversation }: { conversation: Conversation }) {
  const navigate = useNavigate();
  const archiveConversation = useArchiveConversation();
  const deleteConversation = useDeleteConversation();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-sm font-semibold">{conversation.agentName}</h2>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {conversation.title}
          </Badge>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Opções da conversa">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => archiveConversation.mutate(conversation.id)}>
            <Archive className="size-4" />
            Arquivar conversa
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" />
            Excluir conversa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso excluirá permanentemente "{conversation.title}" e todo o seu histórico de mensagens. Essa ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteConversation.mutate(conversation.id);
                navigate("/");
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
