/**
 * Central place to flip from mock services to the real Java/Spring Boot
 * backend. Every feature service checks USE_MOCKS (or, in practice, simply
 * gets swapped for an HTTP-backed implementation of the same interface)
 * so components never need to change.
 */
export const API_CONFIG = {
  authBaseUrl: import.meta.env.VITE_AUTH_API_BASE_URL ?? "/api/auth",
  agentsBaseUrl: import.meta.env.VITE_AGENTS_API_BASE_URL ?? "/api/agents",
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  sseUrl: import.meta.env.VITE_SSE_URL ?? "/api/v1/stream",
  useMocks: (import.meta.env.VITE_USE_MOCKS ?? "true") === "true",
  mockLatencyMs: 450,
};

export function simulateLatency(ms: number = API_CONFIG.mockLatencyMs): Promise<void> {
  const jitter = Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, ms + jitter));
}
