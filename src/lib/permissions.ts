import type { UserRole } from "@/types";

/** OWNER and ADMIN manage the organization: edit agents and see the dashboard. */
export function isOwnerOrAdmin(role: UserRole | undefined): boolean {
  return role === "OWNER" || role === "ADMIN";
}
