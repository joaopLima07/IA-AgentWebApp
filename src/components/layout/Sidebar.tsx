import { useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, SquarePen } from "lucide-react";
import { AppLogo } from "./AppLogo";
import { SidebarNav } from "./SidebarNav";
import { ConversationList } from "@/features/conversations/components/ConversationList";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCreateConversation } from "@/features/conversations/hooks/useConversations";
import { mockAgents } from "@/mocks/agents";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const navigate = useNavigate();
  const createConversation = useCreateConversation();

  const handleNewConversation = () => {
    const defaultAgent = mockAgents.find((a) => a.status === "ACTIVE") ?? mockAgents[0];
    createConversation.mutate(defaultAgent.id, {
      onSuccess: (conversation) => navigate(`/c/${conversation.id}`),
      onError: () => toast.error("Não foi possível iniciar uma nova conversa"),
    });
  };

  return (
    <aside
      className={cn(
        "hidden h-full flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex",
        collapsed ? "w-[68px]" : "w-72"
      )}
    >
      <div className={cn("flex h-14 items-center gap-2 px-3", collapsed && "justify-center px-0")}>
        {!collapsed && <AppLogo />}
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn("ml-auto shrink-0", collapsed && "ml-0")}
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
      </div>

      <div className="px-2 pb-2">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-full"
                onClick={handleNewConversation}
                disabled={createConversation.isPending}
                aria-label="Nova conversa"
              >
                <SquarePen className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Nova conversa</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleNewConversation}
            disabled={createConversation.isPending}
          >
            <SquarePen className="size-4" />
            Nova conversa
          </Button>
        )}
      </div>

      {!collapsed && (
        <>
          <ConversationList />
          <Separator />
        </>
      )}

      <div className={cn("py-2", collapsed && "mt-auto")}>
        <SidebarNav collapsed={collapsed} />
      </div>
    </aside>
  );
}
