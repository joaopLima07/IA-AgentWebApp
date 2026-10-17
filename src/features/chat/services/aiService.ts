import { mockAgents } from "@/mocks/agents";
import type { StreamEvent } from "@/types/sse";
import { genericAssistantResponses, scenarios } from "./scenarios";

export interface StreamMessageParams {
  conversationId: string;
  agentId: string;
  content: string;
  messageId: string;
}

function pickScenario(content: string) {
  const match = scenarios.find((s) => s.match.test(content));
  if (match) return match;
  return null;
}

function sleep(ms: number, signal: { cancelled: boolean }): Promise<void> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(), ms);
    const check = setInterval(() => {
      if (signal.cancelled) {
        clearTimeout(timeout);
        clearInterval(check);
        resolve();
      }
    }, 30);
    // Clear the interval once the timeout naturally resolves.
    setTimeout(() => clearInterval(check), ms + 10);
  });
}

/**
 * Simulates the future backend's SSE stream for a single assistant turn.
 * Mirrors the exact event contract in types/sse.ts (message_start, token,
 * tool_start, tool_end, message_end) so this module can be deleted in
 * favor of `services/sse.ts` + a real endpoint without touching any UI
 * component — everything downstream only depends on `StreamEvent`.
 */
export const aiService = {
  streamMessage(params: StreamMessageParams, onEvent: (event: StreamEvent) => void): () => void {
    const signal = { cancelled: false };

    (async () => {
      const agent = mockAgents.find((a) => a.id === params.agentId) ?? mockAgents[0];

      onEvent({ type: "message_start", messageId: params.messageId, agentId: agent.id, agentName: agent.name });

      await sleep(350 + Math.random() * 250, signal);
      if (signal.cancelled) return;

      const scenario = pickScenario(params.content);

      if (scenario) {
        for (const call of scenario.toolCalls) {
          if (signal.cancelled) return;
          const toolCallId = `tc_${Date.now()}_${Math.round(Math.random() * 1000)}`;
          onEvent({
            type: "tool_start",
            toolCallId,
            tool: call.tool,
            label: call.label,
            parameters: call.parameters,
          });

          await sleep(call.durationMs, signal);
          if (signal.cancelled) return;

          onEvent({
            type: "tool_end",
            toolCallId,
            tool: call.tool,
            status: call.outcome,
            result: call.result,
            errorMessage: call.errorMessage,
            executionTimeMs: call.durationMs,
          });

          await sleep(200 + Math.random() * 200, signal);
        }
      }

      if (signal.cancelled) return;

      const responseText = scenario
        ? scenario.response
        : genericAssistantResponses[Math.floor(Math.random() * genericAssistantResponses.length)];

      // Stream token-by-token, preserving markdown structure by splitting
      // on whitespace boundaries while keeping the separators.
      const tokens = responseText.match(/\S+\s*|\s+/g) ?? [responseText];
      for (const token of tokens) {
        if (signal.cancelled) return;
        onEvent({ type: "token", content: token });
        const isPunctuationPause = /[.!?\n]\s*$/.test(token);
        await sleep(isPunctuationPause ? 90 + Math.random() * 120 : 18 + Math.random() * 45, signal);
      }

      if (signal.cancelled) return;
      onEvent({ type: "message_end", messageId: params.messageId });
    })();

    return () => {
      signal.cancelled = true;
    };
  },
};
