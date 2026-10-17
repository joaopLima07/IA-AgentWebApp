export type UserRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  organizationId?: string;
  createdAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  plan: "STARTER" | "GROWTH" | "ENTERPRISE";
}

/**
 * Auth session built from the Spring Boot `/api/auth/login` response
 * (access token only, no refresh token) plus the `/api/auth/me` user.
 */
export interface AuthSession {
  accessToken: string;
  expiresAt: string;
  user: User;
}

export type Permission =
  | "conversations:read"
  | "conversations:write"
  | "agents:read"
  | "agents:write"
  | "knowledge:read"
  | "knowledge:write"
  | "settings:write"
  | "org:admin";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    "conversations:read",
    "conversations:write",
    "agents:read",
    "agents:write",
    "knowledge:read",
    "knowledge:write",
    "settings:write",
    "org:admin",
  ],
  ADMIN: [
    "conversations:read",
    "conversations:write",
    "agents:read",
    "agents:write",
    "knowledge:read",
    "knowledge:write",
    "settings:write",
  ],
  MEMBER: ["conversations:read", "conversations:write", "agents:read", "knowledge:read"],
  VIEWER: ["conversations:read", "agents:read", "knowledge:read"],
};
