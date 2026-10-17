import { useNavigate } from "react-router-dom";
import { SquarePen } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AppLogo } from "./AppLogo";
import { SidebarNav } from "./SidebarNav";
import { ConversationList } from "@/features/conversations/components/ConversationList";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCreateConversation } from "@/features/conversations/hooks/useConversations";
import { mockAgents } from "@/mocks/agents";
import { toast } from "sonner";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const navigate = useNavigate();
  const createConversation = useCreateConversation();

  const handleNewConversation = () => {
    const defaultAgent = mockAgents.find((a) => a.status === "ACTIVE") ?? mockAgents[0];
    createConversation.mutate(defaultAgent.id, {
      onSuccess: (conversation) => {
        navigate(`/c/${conversation.id}`);
        onOpenChange(false);
      },
      onError: () => toast.error("Não foi possível iniciar uma nova conversa"),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0 text-sidebar-foreground">
        <SheetHeader className="flex-row items-center gap-2 border-b border-sidebar-border">
          <AppLogo />
          <SheetTitle className="sr-only">Navegação</SheetTitle>
        </SheetHeader>

        <div className="px-2 pt-2">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleNewConversation}>
            <SquarePen className="size-4" />
            Nova conversa
          </Button>
        </div>

        <ConversationList />
        <Separator />
        <div className="py-2" onClick={() => onOpenChange(false)}>
          <SidebarNav />
        </div>
      </SheetContent>
    </Sheet>
  );
}
