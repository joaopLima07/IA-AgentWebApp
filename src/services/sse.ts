import type { StreamEvent } from "@/types/sse";

/**
 * Real transport for consuming the future Java/Spring Boot SSE endpoint.
 * Not wired up yet (the app currently uses the mock stream in
 * features/chat/services/mockStreamTransport.ts), but the interface is
 * shared: both implementations expose `connect()` returning a `close()`
 * function, and emit the same StreamEvent union.
 */
export interface StreamTransport {
  connect(onEvent: (event: StreamEvent) => void, onError?: (err: Error) => void): () => void;
}

export function createSseTransport(url: string, accessToken?: string): StreamTransport {
  return {
    connect(onEvent, onError) {
      const fullUrl = accessToken ? `${url}?token=${encodeURIComponent(accessToken)}` : url;
      const source = new EventSource(fullUrl);

      source.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as StreamEvent;
          onEvent(parsed);
        } catch (err) {
          onError?.(err as Error);
        }
      };

      source.onerror = () => {
        onError?.(new Error("SSE connection error"));
        source.close();
      };

      return () => source.close();
    },
  };
}
