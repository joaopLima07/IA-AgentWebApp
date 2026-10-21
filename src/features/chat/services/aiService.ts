import { API_CONFIG } from "@/services/config";
import { refreshAccessToken } from "@/services/api";
import type { StreamEvent } from "@/types/sse";
import { MAX_MESSAGE_LENGTH } from "../constants";

export interface StreamMessageParams {
  conversationId: string;
  content: string;
  messageId: string;
}

function getAccessToken(): string | null {
  try {
    return localStorage.getItem("access_token");
  } catch {
    return null;
  }
}

async function openStream(url: string, content: string, signal: AbortSignal, isRetry = false): Promise<Response> {
  const token = getAccessToken();
  const response = await fetch(url, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
  });
  if (response.status === 401 && !isRetry && (await refreshAccessToken())) {
    return openStream(url, content, signal, true);
  }
  return response;
}

async function errorFromResponse(response: Response): Promise<StreamEvent> {
  // Bean-validation failures (e.g. content over the size limit) come back as a bare
  // "400 Bad Request" with no useful message, so give those a readable one.
  let message =
    response.status === 400 || response.status === 413 || response.status === 422
      ? `Não foi possível enviar a mensagem. Verifique se ela não passa de ${MAX_MESSAGE_LENGTH} caracteres.`
      : response.statusText || "Não foi possível obter a resposta.";
  try {
    const body = await response.json();
    // Prefer the backend's own message when it explains the problem (error envelope: { code, message }).
    if (typeof body?.message === "string" && body.message && body.code) message = body.message;
  } catch {
    // body is not JSON; keep the message above
  }
  return { type: "error", code: String(response.status), message, retryable: response.status >= 500 };
}

/**
 * Consumes the backend's `POST /api/conversations/{id}/messages` SSE stream.
 * The backend streams the assistant reply as plain-text chunks in `data:`
 * lines and persists both messages itself, so each chunk becomes a `token`
 * event and the caller reloads the conversation after `message_end`.
 * EventSource cannot POST or send the bearer header, hence fetch + manual
 * SSE parsing.
 */
export const aiService = {
  streamMessage(params: StreamMessageParams, onEvent: (event: StreamEvent) => void): () => void {
    const controller = new AbortController();
    const url = `${API_CONFIG.chatBaseUrl}/${params.conversationId}/messages`;

    (async () => {
      try {
        const response = await openStream(url, params.content, controller.signal);
        if (!response.ok || !response.body) {
          onEvent(await errorFromResponse(response));
          return;
        }

        onEvent({ type: "message_start", messageId: params.messageId, agentId: "", agentName: "" });

        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += value;

          // SSE events are separated by a blank line; "\r\n" is normalized first.
          buffer = buffer.replace(/\r\n/g, "\n");
          let sep: number;
          while ((sep = buffer.indexOf("\n\n")) !== -1) {
            const rawEvent = buffer.slice(0, sep);
            buffer = buffer.slice(sep + 2);
            const lines = rawEvent.split("\n");
            const eventName = lines.find((line) => line.startsWith("event:"))?.slice(6).trim();
            const data = lines
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(line.startsWith("data: ") ? 6 : 5))
              .join("\n");
            if (eventName === "error") {
              // Backend sends { code, message } as a named "error" event before closing.
              let parsed: { code?: string; message?: string } = {};
              try {
                parsed = JSON.parse(data);
              } catch {
                // keep defaults
              }
              onEvent({
                type: "error",
                code: parsed.code ?? "STREAM_ERROR",
                message: parsed.message ?? "Não foi possível obter a resposta.",
                retryable: true,
              });
              return;
            }
            if (data) onEvent({ type: "token", content: data });
          }
        }

        onEvent({ type: "message_end", messageId: params.messageId });
      } catch (error) {
        if (controller.signal.aborted) return;
        onEvent({
          type: "error",
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Falha na conexão com o servidor.",
          retryable: true,
        });
      }
    })();

    return () => controller.abort();
  },
};
