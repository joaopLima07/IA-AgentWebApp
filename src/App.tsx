import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { PageLoader } from "@/components/common/PageLoader";

const ChatPage = lazy(() => import("@/pages/ChatPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const AgentsPage = lazy(() => import("@/pages/AgentsPage"));
const AgentDetailPage = lazy(() => import("@/pages/AgentDetailPage"));
const KnowledgePage = lazy(() => import("@/pages/KnowledgePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<ChatPage />} />
            <Route path="/c/:conversationId" element={<ChatPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/:agentId" element={<AgentDetailPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
