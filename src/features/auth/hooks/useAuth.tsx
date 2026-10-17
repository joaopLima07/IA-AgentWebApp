import * as React from "react";
import { authService } from "@/features/auth/services/authService";
import type { AuthSession, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const stored = authService.getStoredSession();
    setSession(stored);
    setIsLoading(false);
    if (!stored) return;
    // Validate the stored token against /me; drop the session if the server rejects it.
    authService
      .fetchCurrentUser()
      .then((user) => setSession(user ? { ...stored, user } : null))
      .catch(() => {});
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const s = await authService.login(email, password);
    setSession(s);
  }, []);

  const register = React.useCallback(async (name: string, email: string, password: string, phone: string) => {
    const s = await authService.register(name, email, password, phone);
    setSession(s);
  }, []);

  const logout = React.useCallback(async () => {
    await authService.logout();
    setSession(null);
  }, []);

  const value: AuthContextValue = {
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
