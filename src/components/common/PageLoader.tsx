import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}
