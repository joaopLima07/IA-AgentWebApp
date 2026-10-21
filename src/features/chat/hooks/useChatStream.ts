import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { aiService } from "@/features/chat/services/aiService";
import { conversationService } from "@/features/conversations/services/conversationService";
import { conversationKeys } from "@/features/conversations/hooks/useConversations";
import { DEFAULT_CONVERSATION_TITLE, titleFromMessage } from "@/features/conversations/lib/title";
import type { Message, StreamEvent, ToolCall } from "@/types";

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
}

// Typing speed of the assistant reply. Raise TYPING_INTERVAL_MS (or lower
// CHARS_PER_TICK) to make it slower. When a large backlog builds up the speed
// scales so the text never lags far behind what the server already sent.
const TYPING_INTERVAL_MS = 30;
const CHARS_PER_TICK = 2;
const MAX_BACKLOG_TICKS = 100;

/** Reveals streamed text a few characters at a time, regardless of how big the server chunks are. */
function createTypewriter(onChars: (chars: string) => void) {
  let queue = "";
  let timer: ReturnType<typeof setInterval> | null = null;
  let onDrained: (() => void) | null = null;

  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  const tick = () => {
    if (!queue) {
      stop();
      const cb = onDrained;
      onDrained = null;
      cb?.();
      return;
    }
    let n = Math.max(CHARS_PER_TICK, Math.ceil(queue.length / MAX_BACKLOG_TICKS));
    const code = queue.charCodeAt(n - 1);
    if (code >= 0xd800 && code <= 0xdbff) n++; // don't split a surrogate pair (emoji)
    onChars(queue.slice(0, n));
    queue = queue.slice(n);
  };

  return {
    push(text: string) {
      queue += text;
      if (!timer) timer = setInterval(tick, TYPING_INTERVAL_MS);
    },
    /** Runs `cb` once everything queued so far has been shown. */
    whenDrained(cb: () => void) {
      if (!queue) cb();
      else onDrained = cb;
    },
    cancel() {
      stop();
      queue = "";
      onDrained = null;
    },
  };
}

export function useChatStream(conversationId: string | undefined, conversationTitle?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    setMessages([]);
    setIsLoading(true);
    conversationService
      .getMessages(conversationId)
      .then((msgs) => {
        if (!active) return;
        // A message may have been sent (first message of a new chat) while the
        // history was loading; don't overwrite it with the stale, empty history.
        setMessages((prev) => (prev.length > 0 ? prev : msgs));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
      cancelRef.current?.();
      cancelRef.current = null;
    };
  }, [conversationId]);

  const updateAssistantMessage = useCallback((messageId: string, updater: (m: Message) => Message) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? updater(m) : m)));
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) return;

      const userMessage: Message = {
        id: newId("msg"),
        conversationId,
        role: "USER",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // First message of a new chat: use its first sentence as the conversation title.
      if (conversationTitle === DEFAULT_CONVERSATION_TITLE) {
        conversationService
          .rename(conversationId, titleFromMessage(content))
          .then(() => queryClient.invalidateQueries({ queryKey: conversationKeys.all }))
          .catch(() => {});
      }

      const assistantId = newId("msg");
      const assistantMessage: Message = {
        id: assistantId,
        conversationId,
        role: "ASSISTANT",
        content: "",
        createdAt: new Date().toISOString(),
        toolCalls: [],
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsStreaming(true);

      const typer = createTypewriter((chars) =>
        updateAssistantMessage(assistantId, (m) => ({ ...m, content: m.content + chars }))
      );

      const handleEvent = (event: StreamEvent) => {
        switch (event.type) {
          case "message_start": {
            updateAssistantMessage(assistantId, (m) => ({
              ...m,
              agentId: event.agentId,
              agentName: event.agentName,
            }));
            break;
          }
          case "token": {
            typer.push(event.content);
            break;
          }
          case "tool_start": {
            const toolCall: ToolCall = {
              id: event.toolCallId,
              toolName: event.tool,
              label: event.label,
              status: "RUNNING",
              parameters: event.parameters,
              startedAt: new Date().toISOString(),
            };
            updateAssistantMessage(assistantId, (m) => ({
              ...m,
              toolCalls: [...(m.toolCalls ?? []), toolCall],
            }));
            break;
          }
          case "tool_end": {
            updateAssistantMessage(assistantId, (m) => ({
              ...m,
              toolCalls: (m.toolCalls ?? []).map((tc) =>
                tc.id === event.toolCallId
                  ? {
                      ...tc,
                      status: event.status,
                      result: event.result,
                      errorMessage: event.errorMessage,
                      executionTimeMs: event.executionTimeMs,
                      completedAt: new Date().toISOString(),
                    }
                  : tc
              ),
            }));
            break;
          }
          case "message_end": {
            typer.whenDrained(() => {
              setIsStreaming(false);
              cancelRef.current = null;
              setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)));
              // The backend persists the reply right after the stream ends, so the history may not
              // have it yet. Only swap in the persisted history (real ids and agent) once it does,
              // otherwise the reply we just streamed would vanish.
              const expected = messagesRef.current.length;
              const syncFromBackend = (attempt: number) => {
                conversationService
                  .getMessages(conversationId)
                  .then((persisted) => {
                    if (persisted.length >= expected) {
                      setMessages(persisted);
                      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
                    } else if (attempt < 4) {
                      setTimeout(() => syncFromBackend(attempt + 1), 800);
                    }
                  })
                  .catch(() => {});
              };
              syncFromBackend(0);
            });
            break;
          }
          case "error": {
            typer.whenDrained(() => {
              setIsStreaming(false);
              cancelRef.current = null;
              updateAssistantMessage(assistantId, (m) => ({
                ...m,
                isStreaming: false,
                error: { code: event.code, message: event.message, retryable: event.retryable },
              }));
            });
            break;
          }
        }
      };

      const abortStream = aiService.streamMessage(
        { conversationId, content: content.trim(), messageId: assistantId },
        handleEvent
      );
      cancelRef.current = () => {
        typer.cancel();
        abortStream();
      };
    },
    [conversationId, conversationTitle, queryClient, updateAssistantMessage]
  );

  const stopStreaming = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    setIsStreaming(false);
    setMessages((prev) => prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)));
  }, []);

  return { messages, isLoading, isStreaming, sendMessage, stopStreaming };
}
