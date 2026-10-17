import { mockConversations, mockMessagesByConversation } from "@/mocks/conversations";
import { mockAgents } from "@/mocks/agents";
import { simulateLatency } from "@/services/config";
import type { Conversation, Message } from "@/types";

/**
 * In-memory store standing in for the future Spring Boot conversations
 * API. Every method is async and returns plain data, matching what an
 * HTTP-backed implementation of this same interface would return, so
 * components built against `conversationService` require no changes when
 * this is later swapped for real `fetch` calls.
 */
let conversations: Conversation[] = [...mockConversations];
const messagesStore: Record<string, Message[]> = { ...mockMessagesByConversation };

function sortByUpdated(list: Conversation[]) {
  return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export const conversationService = {
  async getAll(params?: { query?: string; status?: "ACTIVE" | "ARCHIVED" }): Promise<Conversation[]> {
    await simulateLatency();
    let result = sortByUpdated(conversations);
    if (params?.status) {
      result = result.filter((c) => c.status === params.status);
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getById(id: string): Promise<Conversation | undefined> {
    await simulateLatency(250);
    return conversations.find((c) => c.id === id);
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    await simulateLatency(300);
    return messagesStore[conversationId] ?? [];
  },

  async create(agentId: string): Promise<Conversation> {
    await simulateLatency(300);
    const agent = mockAgents.find((a) => a.id === agentId) ?? mockAgents[0];
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: `conv_${Date.now()}`,
      title: "Nova conversa",
      lastMessage: "",
      agentId: agent.id,
      agentName: agent.name,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    };
    conversations = [conversation, ...conversations];
    messagesStore[conversation.id] = [];
    return conversation;
  },

  async appendMessage(conversationId: string, message: Message): Promise<Message> {
    const list = messagesStore[conversationId] ?? [];
    messagesStore[conversationId] = [...list, message];
    conversations = conversations.map((c) =>
      c.id === conversationId
        ? {
            ...c,
            lastMessage: message.role === "USER" ? message.content : c.lastMessage,
            updatedAt: message.createdAt,
            messageCount: c.messageCount + 1,
            title: c.title === "Nova conversa" && message.role === "USER" ? message.content.slice(0, 60) : c.title,
          }
        : c
    );
    return message;
  },

  async updateMessage(conversationId: string, messageId: string, patch: Partial<Message>): Promise<void> {
    const list = messagesStore[conversationId] ?? [];
    messagesStore[conversationId] = list.map((m) => (m.id === messageId ? { ...m, ...patch } : m));
    if (patch.content) {
      conversations = conversations.map((c) =>
        c.id === conversationId ? { ...c, lastMessage: patch.content!, updatedAt: new Date().toISOString() } : c
      );
    }
  },

  async delete(id: string): Promise<void> {
    await simulateLatency(300);
    conversations = conversations.filter((c) => c.id !== id);
    delete messagesStore[id];
  },

  async archive(id: string): Promise<void> {
    await simulateLatency(300);
    conversations = conversations.map((c) => (c.id === id ? { ...c, status: "ARCHIVED" } : c));
  },

  async unarchive(id: string): Promise<void> {
    await simulateLatency(300);
    conversations = conversations.map((c) => (c.id === id ? { ...c, status: "ACTIVE" } : c));
  },
};
