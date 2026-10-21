/**
 * Backend origin, e.g. `https://my-api.azurewebsites.net`. Set VITE_API_BASE_URL
 * at build time (it is baked into the bundle). Leave it empty in development:
 * requests then go to relative `/api/...` paths and the Vite dev proxy forwards
 * them to the backend.
 */
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export const API_CONFIG = {
  authBaseUrl: `${API_ORIGIN}/api/auth`,
  agentsBaseUrl: `${API_ORIGIN}/api/agents`,
  conversationsBaseUrl: `${API_ORIGIN}/api/conversations`,
  // Sending a message is `POST {conversationsBaseUrl}/{id}/messages` (SSE).
  chatBaseUrl: `${API_ORIGIN}/api/conversations`,
  panelBaseUrl: `${API_ORIGIN}/api/panel`,
  baseUrl: `${API_ORIGIN}/api`,
  mockLatencyMs: 450,
};

export function simulateLatency(ms: number = API_CONFIG.mockLatencyMs): Promise<void> {
  const jitter = Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, ms + jitter));
}
