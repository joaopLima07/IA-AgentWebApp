export type ConversationStatus = "ACTIVE" | "ARCHIVED";

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  agentId: string;
  agentName: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  pinned?: boolean;
}
