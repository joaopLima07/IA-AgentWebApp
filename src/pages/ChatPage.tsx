import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useConversation } from "@/features/conversations/hooks/useConversations";
import { useCreateConversation } from "@/features/conversations/hooks/useConversations";
import { useChatStream } from "@/features/chat/hooks/useChatStream";
import { ChatEmptyState } from "@/features/chat/components/ChatEmptyState";
import { ChatHeader } from "@/features/chat/components/ChatHeader";
import { MessageList } from "@/features/chat/components/MessageList";
import { MessageInput } from "@/features/chat/components/MessageInput";
import { PageLoader } from "@/components/common/PageLoader";
import { mockAgents } from "@/mocks/agents";
import { toast } from "sonner";

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const createConversation = useCreateConversation();
  const hasSentInitialMessage = useRef(false);

  const { data: conversation, isLoading: isLoadingConversation } = useConversation(conversationId);
  const { messages, isLoading, isStreaming, sendMessage, stopStreaming } = useChatStream(
    conversationId,
    conversation?.agentId
  );

  const initialMessage = (location.state as { initialMessage?: string } | null)?.initialMessage;

  useEffect(() => {
    if (initialMessage && conversation && !hasSentInitialMessage.current) {
      hasSentInitialMessage.current = true;
      sendMessage(initialMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage, conversation]);

  const handleSendFromEmptyState = (content: string) => {
    const defaultAgent = mockAgents.find((a) => a.status === "ACTIVE") ?? mockAgents[0];
    createConversation.mutate(defaultAgent.id, {
      onSuccess: (newConversation) => {
        navigate(`/c/${newConversation.id}`, { state: { initialMessage: content } });
      },
      onError: () => toast.error("Não foi possível iniciar uma nova conversa"),
    });
  };

  if (!conversationId) {
    return <ChatEmptyState onSend={handleSendFromEmptyState} />;
  }

  if (isLoadingConversation) {
    return <PageLoader />;
  }

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium">Conversa não encontrada</p>
        <p className="text-sm text-muted-foreground">Ela pode ter sido excluída.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader conversation={conversation} />
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      <div className="border-t border-border bg-background px-4 py-3 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <MessageInput onSend={sendMessage} isStreaming={isStreaming} onStop={stopStreaming} />
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
            Os agentes de IA podem cometer erros. Verifique informações importantes antes de agir com base nelas.
          </p>
        </div>
      </div>
    </div>
  );
}
