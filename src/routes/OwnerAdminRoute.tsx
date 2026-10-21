import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { isOwnerOrAdmin } from "@/lib/permissions";

/** Only OWNER and ADMIN pass; everyone else goes back to the chat. */
export function OwnerAdminRoute() {
  const { user } = useAuth();
  if (!isOwnerOrAdmin(user?.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
