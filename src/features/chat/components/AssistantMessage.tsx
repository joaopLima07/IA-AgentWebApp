import { Bot } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ToolCallCard } from "./ToolCallCard";
import { ErrorMessage } from "./ErrorMessage";
import { TypingIndicator } from "./TypingIndicator";
import type { Message } from "@/types";

interface AssistantMessageProps {
  message: Message;
  onRetry?: () => void;
}

export function AssistantMessage({ message, onRetry }: AssistantMessageProps) {
  const showTypingOnly = message.isStreaming && !message.content && !(message.toolCalls && message.toolCalls.length > 0);

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Bot className="size-4" />
      </div>
      <div className="min-w-0 max-w-[85%] flex-1 sm:max-w-[75%]">
        {message.agentName && (
          <p className="mb-1 text-xs font-medium text-muted-foreground">{message.agentName}</p>
        )}

        {message.toolCalls?.map((toolCall) => <ToolCallCard key={toolCall.id} toolCall={toolCall} />)}

        {showTypingOnly && <TypingIndicator />}

        {message.content && (
          <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 shadow-sm">
            <MarkdownRenderer content={message.content} />
            {message.isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-muted-foreground/50 align-middle" />
            )}
          </div>
        )}

        {message.error && (
          <div className="mt-1.5">
            <ErrorMessage error={message.error} onRetry={onRetry} />
          </div>
        )}
      </div>
    </div>
  );
}
