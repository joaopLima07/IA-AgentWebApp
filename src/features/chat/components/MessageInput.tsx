import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Paperclip, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const MAX_HEIGHT_PX = 240;

interface MessageInputProps {
  onSend: (content: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function MessageInput({ onSend, isStreaming, onStop, placeholder, autoFocus }: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!value.trim() || isStreaming) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Grow with the content; only show the scrollbar once the max height is reached.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.ceil(el.scrollHeight) + 1; // +1 avoids a sub-pixel scrollbar from rounding
    el.style.height = `${Math.min(next, MAX_HEIGHT_PX)}px`;
    el.style.overflowY = next > MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [value]);

  return (
    <div className="flex w-full flex-col rounded-2xl border border-input bg-background shadow-sm transition-shadow focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/30">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Pergunte alguma coisa..."}
        rows={1}
        autoFocus={autoFocus}
        className="scrollbar-thin min-h-10 resize-none rounded-none border-0 bg-transparent px-4 pb-1 pt-3 text-sm leading-relaxed shadow-none focus-visible:ring-0"
        aria-label="Mensagem"
      />

      <div className="flex items-center justify-between px-2 pb-2 pt-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              aria-label="Anexar um arquivo"
            >
              <Paperclip className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Anexar um arquivo (em breve)</TooltipContent>
        </Tooltip>

        {isStreaming ? (
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            className="rounded-full"
            onClick={onStop}
            aria-label="Parar geração"
          >
            <Square className="size-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon-sm"
            className={cn("rounded-full transition-opacity", !value.trim() && "opacity-50")}
            onClick={handleSend}
            disabled={!value.trim()}
            aria-label="Enviar mensagem"
          >
            <ArrowUp className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
