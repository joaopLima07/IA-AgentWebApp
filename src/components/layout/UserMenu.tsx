import { useNavigate } from "react-router-dom";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-md p-1 pr-2 text-sm transition-colors hover:bg-secondary"
          aria-label="Menu do usuário"
        >
          <Avatar className="size-7">
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate font-medium sm:inline">{user.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-foreground">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/settings")}>
          <UserIcon className="size-4" />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/settings")}>
          <Settings className="size-4" />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
