import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Paperclip, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  return (
    <div className="flex w-full items-end gap-2 rounded-xl border border-input bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground"
            aria-label="Anexar um arquivo"
          >
            <Paperclip className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Anexar um arquivo (em breve)</TooltipContent>
      </Tooltip>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Pergunte alguma coisa..."}
        rows={1}
        autoFocus={autoFocus}
        className="max-h-48 min-h-9 flex-1 resize-none border-0 bg-transparent px-1 py-1.5 shadow-none focus-visible:ring-0"
        aria-label="Mensagem"
      />

      {isStreaming ? (
        <Button type="button" size="icon" variant="secondary" className="shrink-0" onClick={onStop} aria-label="Parar geração">
          <Square className="size-3.5 fill-current" />
        </Button>
      ) : (
        <Button
          type="button"
          size="icon"
          className={cn("shrink-0 transition-opacity", !value.trim() && "opacity-50")}
          onClick={handleSend}
          disabled={!value.trim()}
          aria-label="Enviar mensagem"
        >
          <ArrowUp className="size-4" />
        </Button>
      )}
    </div>
  );
}
