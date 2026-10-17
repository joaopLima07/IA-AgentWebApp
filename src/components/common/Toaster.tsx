import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/hooks/useTheme";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "border border-border bg-popover text-popover-foreground shadow-md",
          title: "text-sm font-medium",
          description: "text-sm text-muted-foreground",
        },
      }}
    />
  );
}
