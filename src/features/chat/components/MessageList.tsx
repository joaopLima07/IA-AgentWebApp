import { useEffect, useRef } from "react";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onRetry?: (message: Message) => void;
}

export function MessageList({ messages, isLoading, onRetry }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        <Skeleton className="ml-auto h-10 w-2/3 rounded-2xl" />
        <Skeleton className="h-24 w-3/4 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6">
      {messages.map((message) =>
        message.role === "USER" ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <AssistantMessage key={message.id} message={message} onRetry={onRetry ? () => onRetry(message) : undefined} />
        )
      )}
      <div ref={bottomRef} />
    </div>
  );
}
