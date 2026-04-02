"use client";

import { useState, useCallback }   from "react";
import Link                         from "next/link";
import { usePathname, useRouter }   from "next/navigation";
import {
  Menu, Search, Bell, Plus,
  ChevronDown, User, Settings, LogOut,
} from "lucide-react";

import { cn }                  from "@/lib/utils/cn";
import { useSidebar }          from "@/components/dashboard/sidebar-context";
import { NotificationPanel }   from "@/components/dashboard/NotificationPanel";
import { useAuth }             from "@/lib/hooks/useAuth";
import { getInitials }         from "@/lib/utils";

// ── Titre de page par route ───────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  "/dashboard":          "Tableau de bord",
  "/declare":            "Déclarer un bien",
  "/my-properties":      "Mes biens",
  "/properties":         "Biens immobiliers",
  "/commissions":        "Commissions",
  "/referral":           "Parrainage",
  "/assigned":           "Biens assignés",
  "/apporteurs":         "Mes apporteurs",
  "/agents":             "Agents",
  "/subscription":       "Abonnement",
  "/admin":              "Administration",
  "/admin/users":        "Utilisateurs",
  "/admin/properties":   "Biens — Admin",
  "/admin/pipeline":     "Pipeline",
  "/admin/commissions":  "Commissions — Admin",
  "/admin/contracts":    "Contrats",
  "/admin/logs":         "Journaux système",
  "/settings":           "Paramètres",
  "/notifications":      "Notifications",
};

function usePageTitle(): string {
  const pathname = usePathname();
  // Correspondance exacte puis préfixe le plus long
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.keys(PAGE_TITLES)
    .filter((k) => pathname.startsWith(k) && k !== "/")
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_TITLES[match] : "Waseet";
}

// ── Composant ─────────────────────────────────────────────────
export function Header() {
  const { toggle }               = useSidebar();
  const { user, logout }         = useAuth();
  const router                   = useRouter();
  const pageTitle                = usePageTitle();

  const [notifOpen, setNotifOpen]     = useState(false);
  const [dropOpen, setDropOpen]       = useState(false);
  const [notifCount, setNotifCount]   = useState(
    user?._count?.notifications ?? 0
  );

  const handleLogout = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);

  const initials = user ? getInitials(user.firstName, user.lastName) : "?";

  return (
    <header className="h-16 shrink-0 bg-white border-b border-sand-dark flex items-center px-7 gap-4 sticky top-0 z-50 shadow-sm">

      {/* Hamburger mobile */}
      <button
        onClick={toggle}
        className="lg:hidden p-2 rounded-xl text-charcoal-muted hover:bg-sand-light hover:text-black transition-colors"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Titre de page */}
      <h1 className="font-bold text-black tracking-tight text-lg hidden sm:block shrink-0 flex-1">
        {pageTitle}
      </h1>

      {/* Spacer + Barre de recherche */}
      <div className="hidden md:flex items-center gap-2 bg-sand-light border border-sand-dark rounded-xl px-3.5 py-2 max-w-xs focus-within:border-[#635BFF] focus-within:ring-2 focus-within:ring-[#635BFF]/10 transition-all">
        <Search className="w-4 h-4 text-charcoal-muted shrink-0 pointer-events-none" />
        <input
          type="search"
          placeholder="Rechercher un bien, un client…"
          className="border-none outline-none text-sm text-black placeholder:text-charcoal-muted bg-transparent flex-1 min-w-0"
        />
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        {/* CTA Déclarer */}
        <Link
          href="/declare"
          className="hidden sm:flex items-center gap-1.5 bg-[#635BFF] hover:bg-[#4C45E0] text-white font-semibold text-sm rounded-xl py-2 px-4 transition-all shadow-[#635BFF]/25 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          Déclarer
        </Link>

        {/* Cloche notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setDropOpen(false); }}
            className="relative w-9 h-9 rounded-xl border border-sand-dark bg-white flex items-center justify-center text-charcoal-muted hover:bg-sand-light transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white" />
            )}
          </button>

          <NotificationPanel
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            onCountChange={setNotifCount}
          />
        </div>

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => { setDropOpen((v) => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-sand-light transition-colors"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: "linear-gradient(135deg,#C9973A,#E5B85C)" }}
            >
              {initials}
            </div>
            <span className="hidden md:block text-sm font-medium text-black max-w-30 truncate">
              {user?.firstName ?? "…"}
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-charcoal-muted transition-transform", dropOpen && "rotate-180")} />
          </button>

          {/* Dropdown menu */}
          {dropOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-sand-dark shadow-xl shadow-black/10 py-1.5 z-50 animate-slide-down">
                {/* Info utilisateur */}
                <div className="px-4 py-3 border-b border-sand-dark/50 mb-1">
                  <p className="text-sm font-semibold text-black truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-charcoal-muted truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal hover:bg-sand-light hover:text-black transition-colors"
                >
                  <User className="w-4 h-4 text-charcoal-muted" />
                  Mon profil
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal hover:bg-sand-light hover:text-black transition-colors"
                >
                  <Settings className="w-4 h-4 text-charcoal-muted" />
                  Paramètres
                </Link>

                <div className="border-t border-sand-dark/50 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
