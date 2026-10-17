import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex h-svh w-full flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <Compass className="size-5" />
      </div>
      <h1 className="text-lg font-semibold">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-muted-foreground">A página que você está procurando não existe ou pode ter sido movida.</p>
      <Button asChild className="mt-2">
        <Link to="/">Voltar ao chat</Link>
      </Button>
    </div>
  );
}
