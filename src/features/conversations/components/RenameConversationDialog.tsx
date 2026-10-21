import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRenameConversation } from "@/features/conversations/hooks/useConversations";
import type { Conversation } from "@/types";

const MAX_TITLE_LENGTH = 100;

interface RenameConversationDialogProps {
  conversation: Conversation | null;
  onOpenChange: (open: boolean) => void;
}

export function RenameConversationDialog({ conversation, onOpenChange }: RenameConversationDialogProps) {
  const rename = useRenameConversation();
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (conversation) setTitle(conversation.title);
  }, [conversation]);

  const trimmed = title.trim();
  const canSave = !!trimmed && trimmed !== conversation?.title && !rename.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!conversation || !canSave) return;
    rename.mutate({ id: conversation.id, title: trimmed }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={!!conversation} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Renomear conversa</DialogTitle>
          </DialogHeader>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            autoFocus
            onFocus={(e) => e.target.select()}
            aria-label="Novo nome da conversa"
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSave}>
              {rename.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
