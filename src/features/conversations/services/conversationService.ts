import { mockAgents } from "@/mocks/agents";
import { apiClient } from "@/services/api";
import { API_CONFIG } from "@/services/config";
import { ApiRequestError } from "@/types/api";
import type { Conversation, ConversationStatus, Message, MessageRole } from "@/types";

/**
 * Conversation service backed by the Spring Boot `/api/conversations`
 * endpoints: list, get (with the latest messages), load older messages,
 * create, rename, archive, unarchive and delete. Sending a message is the
 * SSE stream in `features/chat/services/aiService.ts`.
 */

const conversationsApi = { baseUrl: API_CONFIG.conversationsBaseUrl };

interface ConversationSummaryResponse {
  id: number;
  userId: number;
  title: string;
  status: ConversationStatus;
  /** Last message sent by the user; only present in the list endpoint. */
  lastMessage?: string | null;
}

interface MessagesResponse {
  id: number;
  conversationId: number;
  role: MessageRole;
  agentId: number | null;
  content: string;
  createdAt: string;
}

interface ConversationDetailResponse extends ConversationSummaryResponse {
  messages: MessagesResponse[];
}

interface CreateConversationResponse {
  id: number;
  title: string;
  status: ConversationStatus;
  createdAt: string;
}

// The backend picks the agent per message (router) and does not return
// activity dates or a last-message preview yet. The placeholder agent keeps
// the mocked chat stream working until POST /{id}/messages is wired.
const placeholderAgent = () => mockAgents.find((a) => a.status === "ACTIVE") ?? mockAgents[0];

function fromSummary(c: ConversationSummaryResponse): Conversation {
  const agent = placeholderAgent();
  return {
    id: String(c.id),
    title: c.title,
    lastMessage: c.lastMessage ?? "",
    agentId: agent.id,
    agentName: agent.name,
    status: c.status,
    createdAt: "",
    updatedAt: "",
    messageCount: 0,
  };
}

function fromMessage(m: MessagesResponse): Message {
  return {
    id: String(m.id),
    conversationId: String(m.conversationId),
    role: m.role,
    content: m.content,
    createdAt: m.createdAt,
    agentId: m.agentId != null ? String(m.agentId) : undefined,
  };
}

export const conversationService = {
  async getAll(params?: { query?: string; status?: "ACTIVE" | "ARCHIVED" }): Promise<Conversation[]> {
    const response = await apiClient.get<ConversationSummaryResponse[]>("", conversationsApi);
    let result = response.map(fromSummary);
    if (params?.status) {
      result = result.filter((c) => c.status === params.status);
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(q));
    }
    return result;
  },

  async getById(id: string): Promise<Conversation | undefined> {
    try {
      const detail = await apiClient.get<ConversationDetailResponse>(`/${id}`, conversationsApi);
      return { ...fromSummary(detail), messageCount: detail.messages.length };
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 404) return undefined;
      throw error;
    }
  },

  /** Latest messages of the conversation, oldest first. */
  async getMessages(conversationId: string): Promise<Message[]> {
    const detail = await apiClient.get<ConversationDetailResponse>(`/${conversationId}`, conversationsApi);
    return detail.messages.map(fromMessage);
  },

  /** Up to 30 messages older than `beforeMessageId`, oldest first. */
  async getMessagesBefore(conversationId: string, beforeMessageId: string): Promise<Message[]> {
    const detail = await apiClient.get<ConversationDetailResponse>(
      `/${conversationId}/messages?before=${encodeURIComponent(beforeMessageId)}`,
      conversationsApi,
    );
    return detail.messages.map(fromMessage);
  },

  /** The agent is chosen by the backend on each message, so none is sent here. */
  async create(): Promise<Conversation> {
    const created = await apiClient.post<CreateConversationResponse>(
      "",
      { title: "Nova conversa", status: "ACTIVE" },
      conversationsApi,
    );
    const agent = placeholderAgent();
    return {
      id: String(created.id),
      title: created.title,
      lastMessage: "",
      agentId: agent.id,
      agentName: agent.name,
      status: created.status,
      createdAt: created.createdAt,
      updatedAt: created.createdAt,
      messageCount: 0,
    };
  },

  /** PATCH /api/conversations/{id} */
  async rename(id: string, newTitle: string): Promise<void> {
    await apiClient.patch<ConversationSummaryResponse>(`/${id}`, { newTitle }, conversationsApi);
  },

  /** DELETE /api/conversations/{id} (204) */
  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(`/${id}`, conversationsApi);
  },

  /** POST /api/conversations/{id}/archive (204) */
  async archive(id: string): Promise<void> {
    await apiClient.post<void>(`/${id}/archive`, undefined, conversationsApi);
  },

  /** POST /api/conversations/{id}/unarchive (204) */
  async unarchive(id: string): Promise<void> {
    await apiClient.post<void>(`/${id}/unarchive`, undefined, conversationsApi);
  },

  // Messages are persisted by the backend while the SSE stream runs, so these
  // are no-ops kept for the chat hook's optimistic updates.

  async appendMessage(_conversationId: string, message: Message): Promise<Message> {
    return message;
  },

  async updateMessage(_conversationId: string, _messageId: string, _patch: Partial<Message>): Promise<void> {},
};
