"use client";

import { useEffect }          from "react";
import { useRouter }          from "next/navigation";
import { SidebarProvider, useSidebar } from "@/components/dashboard/sidebar-context";
import { Sidebar }            from "@/components/dashboard/Sidebar";
import { Header }             from "@/components/dashboard/Header";
import { useAuth }            from "@/lib/hooks/useAuth";
import { cn }                 from "@/lib/utils/cn";

// ── Shell interne (accès au contexte sidebar) ─────────────────
function ShellInner({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useSidebar();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirection si non authentifié (double protection après middleware)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf8f5]">
      {/* ── Overlay mobile ───────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={close}
          aria-hidden
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <div
        className={cn(
          // Desktop : toujours visible
          "hidden lg:flex lg:flex-col lg:shrink-0",
          "w-64",
        )}
      >
        <Sidebar />
      </div>

      {/* Sidebar mobile (slide-in) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col lg:hidden",
          "w-[260px] transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar />
      </div>

      {/* ── Contenu principal ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-7 max-w-400 mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Export public (avec Provider) ─────────────────────────────
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  );
}
