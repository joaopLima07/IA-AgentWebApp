/**
 * Streaming event contract shared with the future Java backend.
 * The backend will emit these over Server-Sent Events; the mock
 * transport in features/chat/services simulates the same shape.
 */
export type StreamEventType =
  | "message_start"
  | "token"
  | "tool_start"
  | "tool_end"
  | "message_end"
  | "error";

export interface MessageStartEvent {
  type: "message_start";
  messageId: string;
  agentId: string;
  agentName: string;
}

export interface TokenEvent {
  type: "token";
  content: string;
}

export interface ToolStartEvent {
  type: "tool_start";
  toolCallId: string;
  tool: string;
  label: string;
  parameters?: Record<string, unknown>;
}

export interface ToolEndEvent {
  type: "tool_end";
  toolCallId: string;
  tool: string;
  status: "SUCCESS" | "ERROR";
  result?: Record<string, unknown> | string;
  errorMessage?: string;
  executionTimeMs?: number;
}

export interface MessageEndEvent {
  type: "message_end";
  messageId: string;
}

export interface StreamErrorEvent {
  type: "error";
  code: string;
  message: string;
  retryable: boolean;
}

export type StreamEvent =
  | MessageStartEvent
  | TokenEvent
  | ToolStartEvent
  | ToolEndEvent
  | MessageEndEvent
  | StreamErrorEvent;
