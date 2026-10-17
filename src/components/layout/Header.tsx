import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "./AppLogo";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-3 sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileSidebar}
        aria-label="Abrir menu de navegação"
      >
        <Menu className="size-5" />
      </Button>

      <div className="lg:hidden">
        <AppLogo />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}
