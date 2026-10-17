import { API_CONFIG } from "./config";
import { ApiRequestError, type ApiError } from "@/types/api";

/**
 * Thin fetch wrapper matching the shape the Spring Boot backend will use:
 * JSON in/out, bearer auth header, and a typed error channel. Mock
 * services do not use this directly (they resolve in-memory data), but
 * real HTTP-backed services should be implemented against this client so
 * only `services/api.ts` needs to change when the backend goes live.
 */

interface RequestOptions extends RequestInit {
  auth?: boolean;
  baseUrl?: string;
}

function getAccessToken(): string | null {
  try {
    return localStorage.getItem("access_token");
  } catch {
    return null;
  }
}

const SESSION_KEY = "auth_session";
const TOKEN_KEY = "access_token";

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Exchanges the httpOnly refresh cookie for a new access token
 * (POST /api/auth/refresh). Concurrent callers share one request.
 */
export function refreshAccessToken(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${API_CONFIG.authBaseUrl}/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) return false;
      const { accessToken, expiresIn } = (await response.json()) as { accessToken: string; expiresIn: number };
      localStorage.setItem(TOKEN_KEY, accessToken);
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ ...session, accessToken, expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() }),
        );
      }
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { auth = true, baseUrl = API_CONFIG.baseUrl, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  if (response.status === 401 && auth && !isRetry && (await refreshAccessToken())) {
    return request<T>(path, options, true);
  }

  if (!response.ok) {
    let error: ApiError;
    try {
      const body = await response.json();
      error = { ...body, status: response.status };
    } catch {
      error = { code: "UNKNOWN", message: response.statusText, status: response.status };
    }
    throw new ApiRequestError(error);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};
