"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, ClipboardList, Copy, Users, Coins,
  LogOut, ChevronRight, AlertTriangle, Menu,
  Building2, GitBranch, FileText, ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/hooks/useAuth";

// ── Types ──────────────────────────────────────────────────────────────────────
interface NavItem {
  href:  string;
  label: string;
  icon:  React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin",              label: "Tableau de bord", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/admin/declarations", label: "Déclarations",    icon: <ClipboardList   className="w-4 h-4" /> },
  { href: "/admin/properties",   label: "Biens",           icon: <Building2       className="w-4 h-4" /> },
  { href: "/admin/pipeline",     label: "Pipeline",        icon: <GitBranch       className="w-4 h-4" /> },
  { href: "/admin/contracts",    label: "Contrats",        icon: <FileText        className="w-4 h-4" /> },
  { href: "/admin/logs",         label: "Logs",            icon: <ScrollText      className="w-4 h-4" /> },
  { href: "/admin/duplicates",   label: "Doublons",        icon: <Copy            className="w-4 h-4" /> },
  { href: "/admin/users",        label: "Utilisateurs",    icon: <Users           className="w-4 h-4" /> },
  { href: "/admin/commissions",  label: "Commissions",     icon: <Coins           className="w-4 h-4" /> },
];

// ── Composant ─────────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, logout: authLogout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirection si non-admin — attend la fin du chargement auth
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  function logout() {
    authLogout();
    router.push("/login");
  }

  // Spinner pendant la vérification auth ou si l'utilisateur n'est pas ADMIN
  if (isLoading || !isAuthenticated || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand">
        <div className="w-8 h-8 rounded-full border-2 border-[#635BFF] border-t-transparent animate-spin" />
      </div>
    );
  }

  const adminName = user.firstName ?? "Admin";

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={cn(
      "flex flex-col bg-obsidian text-white",
      mobile ? "w-full h-full" : "w-60 min-h-screen sticky top-0 h-screen"
    )}>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <img src="/logo.svg" alt="Waseet logo" className="h-8 w-auto brightness-0 invert" />
      </div>

      {/* Alerte admin */}
      <div className="px-4 py-3 bg-[#635BFF]/10 border-b border-[#635BFF]/20">
        <div className="flex items-center gap-2 text-[#635BFF]">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <p className="text-[11px] font-medium">Espace administrateur</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[#635BFF]/15 text-[#635BFF] font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                {item.label}
              </span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#635BFF]/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-[#635BFF]">
                {adminName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-white">{adminName}</p>
              <p className="text-[10px] text-white/40">Administrateur</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <Link
          href="/dashboard"
          className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
        >
          ← Retour au dashboard
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-sand">
      {/* Sidebar desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-obsidian/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Drawer mobile */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar mobile />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-obsidian text-white border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold">Admin Waseet</span>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Page */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
