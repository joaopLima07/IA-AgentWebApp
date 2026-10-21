import { NavLink } from "react-router-dom";
import { LayoutDashboard, Bot, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { isOwnerOrAdmin } from "@/lib/permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const items = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard, adminOnly: true },
  { to: "/agents", label: "Agentes", icon: Bot },
  { to: "/settings", label: "Configurações", icon: Settings },
];

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const { user } = useAuth();
  const visibleItems = items.filter((item) => !item.adminOnly || isOwnerOrAdmin(user?.role));

  return (
    <nav className="flex flex-col gap-0.5 px-2" aria-label="Navegação da plataforma">
      {visibleItems.map(({ to, label, icon: Icon }) => {
        const link = (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0"
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        );

        if (!collapsed) return link;

        return (
          <Tooltip key={to}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
