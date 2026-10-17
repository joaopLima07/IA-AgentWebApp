import { mockOrganization } from "@/mocks/user";
import { apiClient } from "@/services/api";
import { API_CONFIG } from "@/services/config";
import { ApiRequestError } from "@/types/api";
import type { AuthSession, User, UserRole } from "@/types";

/**
 * Auth service backed by the Spring Boot `/api/auth/*` endpoints
 * (register, login, me, refresh, logout). The access token is short-lived;
 * the refresh token lives in an httpOnly cookie and is exchanged for a new
 * access token by `apiClient` when a request returns 401.
 */

const SESSION_KEY = "auth_session";
const TOKEN_KEY = "access_token";

const authApi = { baseUrl: API_CONFIG.authBaseUrl };

interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

interface MeResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
}

function toUser(me: MeResponse): User {
  return {
    id: String(me.id),
    name: me.fullName,
    email: me.email,
    phone: me.phone,
    role: me.role,
  };
}

function persistSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(TOKEN_KEY, session.accessToken);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

async function login(email: string, password: string): Promise<AuthSession> {
  const { accessToken, expiresIn } = await apiClient.post<LoginResponse>(
    "/login",
    { email, password },
    { ...authApi, auth: false },
  );
  // /me needs the token, which apiClient reads from storage.
  localStorage.setItem(TOKEN_KEY, accessToken);
  try {
    const me = await apiClient.get<MeResponse>("/me", authApi);
    const session: AuthSession = {
      accessToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      user: toUser(me),
    };
    persistSession(session);
    return session;
  } catch (error) {
    clearSession();
    throw error;
  }
}

export const authService = {
  login,

  /** Registers the user, then signs in (the backend returns no token on register). */
  async register(name: string, email: string, password: string, phone: string): Promise<AuthSession> {
    await apiClient.post("/register", { fullName: name, email, password, phone }, { ...authApi, auth: false });
    return login(email, password);
  },

  /** Always succeeds for any well-formed e-mail: the backend doesn't reveal whether an account exists. */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/forgotPassword", { email }, { ...authApi, auth: false });
  },

  /** Checks the code e-mailed by `forgotPassword`; returns the token that authorizes `resetPassword`. */
  async verifyResetCode(email: string, token: string): Promise<string> {
    const { resetToken } = await apiClient.post<{ resetToken: string; expiresIn: number }>(
      "/verifyResetCode",
      { email, token },
      { ...authApi, auth: false },
    );
    return resetToken;
  },

  /** Sets a new password using the token returned by `verifyResetCode`. */
  async resetPassword(email: string, resetToken: string, newPassword: string): Promise<void> {
    await apiClient.post("/resetPassword", { email, resetToken, newPassword }, { ...authApi, auth: false });
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/logout", undefined, { ...authApi, auth: false });
    } catch {
      // Local sign-out must succeed even if the server can't be reached.
    } finally {
      clearSession();
    }
  },

  /** Re-fetches the current user. Returns null (and clears the session) if the token was rejected. */
  async fetchCurrentUser(): Promise<User | null> {
    try {
      return toUser(await apiClient.get<MeResponse>("/me", authApi));
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        clearSession();
        return null;
      }
      throw error;
    }
  },

  getStoredSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      // An expired access token is fine here: the /me check on startup
      // refreshes it, or clears the session if the refresh token is gone too.
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },

  /** No backend endpoint yet — still mocked. */
  getOrganization() {
    return mockOrganization;
  },
};
