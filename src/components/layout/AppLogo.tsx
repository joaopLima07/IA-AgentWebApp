import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";

export function AppLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <img src={logoIcon} alt="" className="size-7 shrink-0 rounded-md" />
      <span
        className={cn(
          "truncate text-sm font-semibold tracking-tight transition-opacity",
          collapsed && "w-0 opacity-0"
        )}
      >
        AI Nexus
      </span>
    </div>
  );
}
