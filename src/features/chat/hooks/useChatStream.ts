import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { aiService } from "@/features/chat/services/aiService";
import { conversationService } from "@/features/conversations/services/conversationService";
import { conversationKeys } from "@/features/conversations/hooks/useConversations";
import type { Message, StreamEvent, ToolCall } from "@/types";

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
}

export function useChatStream(conversationId: string | undefined, agentId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    conversationService.getMessages(conversationId).then((msgs) => {
      if (active) {
        setMessages(msgs);
        setIsLoading(false);
      }
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
      if (!conversationId || !agentId || !content.trim()) return;

      const userMessage: Message = {
        id: newId("msg"),
        conversationId,
        role: "USER",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      await conversationService.appendMessage(conversationId, userMessage);
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });

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
            updateAssistantMessage(assistantId, (m) => ({ ...m, content: m.content + event.content }));
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
            setIsStreaming(false);
            cancelRef.current = null;
            setMessages((prev) => {
              const finalMessage = prev.find((m) => m.id === assistantId);
              if (finalMessage) {
                conversationService
                  .appendMessage(conversationId, { ...finalMessage, isStreaming: false })
                  .then(() => queryClient.invalidateQueries({ queryKey: conversationKeys.all }));
              }
              return prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m));
            });
            break;
          }
          case "error": {
            setIsStreaming(false);
            cancelRef.current = null;
            updateAssistantMessage(assistantId, (m) => ({
              ...m,
              isStreaming: false,
              error: { code: event.code, message: event.message, retryable: event.retryable },
            }));
            break;
          }
        }
      };

      cancelRef.current = aiService.streamMessage(
        { conversationId, agentId, content: content.trim(), messageId: assistantId },
        handleEvent
      );
    },
    [conversationId, agentId, queryClient, updateAssistantMessage]
  );

  const stopStreaming = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    setIsStreaming(false);
    setMessages((prev) => prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)));
  }, []);

  return { messages, isLoading, isStreaming, sendMessage, stopStreaming };
}
