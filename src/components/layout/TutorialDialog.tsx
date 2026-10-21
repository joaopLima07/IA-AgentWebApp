import { useState } from "react";
import { Bot, FilePen, HelpCircle, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const steps = [
  {
    icon: MessageSquare,
    title: "Peça os dados que você precisa",
    text: 'Escreva no chat o que você quer consultar. Por exemplo: "Quero os dados do fiscal".',
  },
  {
    icon: FilePen,
    title: "Para alterar, siga o que a IA pedir",
    text: "Se quiser alterar algo, faça o pedido e a IA vai te dizer quais informações precisa. É só responder.",
  },
  {
    icon: Bot,
    title: "Escolha outros agentes",
    text: "Além do agente de pedidos, existem outros agentes que você pode selecionar para tarefas diferentes.",
  },
];

export function TutorialDialog() {
  const [seen, setSeen] = useLocalStorage("tutorial-seen", false);
  const [manualOpen, setManualOpen] = useState(false);
  const open = !seen || manualOpen;

  const handleClose = () => {
    setManualOpen(false);
    setSeen(true);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setManualOpen(true)}>
        <HelpCircle />
        <span className="hidden sm:inline">Tutorial</span>
        <span className="sr-only sm:hidden">Tutorial</span>
      </Button>

      <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>
            <DialogTitle>Bem-vindo! Veja como usar</DialogTitle>
            <DialogDescription>Um guia rápido para você aproveitar o assistente.</DialogDescription>
          </DialogHeader>

          <ol className="space-y-4">
            {steps.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>

          <DialogFooter>
            <Button onClick={handleClose}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
