import { useNavigate } from "react-router-dom";
import { Archive, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { RenameConversationDialog } from "@/features/conversations/components/RenameConversationDialog";
import type { Conversation } from "@/types";

export function ChatHeader({ conversation }: { conversation: Conversation }) {
  const navigate = useNavigate();
  const archiveConversation = useArchiveConversation();
  const deleteConversation = useDeleteConversation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [renaming, setRenaming] = useState(false);

  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold">{conversation.title}</h2>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Opções da conversa">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setRenaming(true)}>
            <Pencil className="size-4" />
            Renomear conversa
          </DropdownMenuItem>
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

      <RenameConversationDialog
        conversation={renaming ? conversation : null}
        onOpenChange={(open) => !open && setRenaming(false)}
      />

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
