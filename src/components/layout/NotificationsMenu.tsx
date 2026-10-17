import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const notifications = [
  {
    id: "n1",
    title: "Falha no processamento do documento",
    description: "\"FAQ\" não pôde ser processado. Revise o arquivo e envie-o novamente.",
    time: "há 6h",
  },
  {
    id: "n2",
    title: "Novo agente publicado",
    description: "Order Management agora está ativo para sua organização.",
    time: "há 1d",
  },
  {
    id: "n3",
    title: "Resumo semanal de uso",
    description: "1.284 conversas atendidas esta semana, um aumento de 8,2%.",
    time: "há 2d",
  },
];

export function NotificationsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between text-foreground">
          Notificações
          <Badge variant="secondary">{notifications.length} novas</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((n) => (
          <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 whitespace-normal py-2">
            <span className="text-sm font-medium">{n.title}</span>
            <span className="text-xs text-muted-foreground">{n.description}</span>
            <span className="mt-0.5 text-[11px] text-muted-foreground/70">{n.time}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
