import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Header } from "@/components/layout/Header";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function AppLayout() {
  const [collapsed, setCollapsed] = useLocalStorage("sidebar-collapsed", false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Ir para o conteúdo principal
      </a>
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main id="main-content" className="min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
