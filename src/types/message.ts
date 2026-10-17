export type MessageRole = "USER" | "ASSISTANT" | "TOOL" | "SYSTEM";

export type ToolCallStatus = "RUNNING" | "SUCCESS" | "ERROR";

export interface ToolCall {
  id: string;
  toolName: string;
  label: string;
  status: ToolCallStatus;
  parameters?: Record<string, unknown>;
  result?: Record<string, unknown> | string;
  executionTimeMs?: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

export interface MessageError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  agentId?: string;
  agentName?: string;
  toolCalls?: ToolCall[];
  error?: MessageError;
  isStreaming?: boolean;
}
