"use client";

import Link                from "next/link";
import { usePathname }     from "next/navigation";
import { useCallback, useState } from "react";
import {
  LayoutDashboard, PlusCircle, Building2, Banknote,
  Users, CreditCard,
  GitBranch, FileText, ScrollText, LogOut, Copy, Check,
  type LucideIcon,
} from "lucide-react";

import { cn }          from "@/lib/utils/cn";
import { Badge }       from "@/components/ui/Badge";
import { useSidebar }  from "@/components/dashboard/sidebar-context";
import { useAuth }     from "@/lib/hooks/useAuth";
import { ROLES }       from "@/lib/config";
import { getInitials } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface NavItem {
  href:   string;
  label:  string;
  icon:   LucideIcon;
  badge?: number;
  exact?: boolean;
}

// ── Navigation par rôle ───────────────────────────────────────
const NAV: Record<string, NavItem[]> = {
  DEAL_FINDER: [
    { href: "/dashboard",      label: "Dashboard",     icon: LayoutDashboard, exact: true },
    { href: "/declare",        label: "Déclarer un bien", icon: PlusCircle },
    { href: "/my-properties",  label: "Mes biens",     icon: Building2 },
    { href: "/commissions",    label: "Commissions",   icon: Banknote },
    { href: "/referral",       label: "Parrainage",    icon: Users },
  ],
  AGENT: [
    { href: "/dashboard",      label: "Dashboard",     icon: LayoutDashboard, exact: true },
    { href: "/assigned",       label: "Biens assignés",icon: Building2 },
    { href: "/apporteurs",     label: "Mes apporteurs",icon: Users },
    { href: "/commissions",    label: "Commissions",   icon: Banknote },
  ],
  AGENCY: [
    { href: "/dashboard",      label: "Dashboard",     icon: LayoutDashboard, exact: true },
    { href: "/properties",     label: "Biens",         icon: Building2 },
    { href: "/agents",         label: "Agents",        icon: Users },
    { href: "/commissions",    label: "Commissions",   icon: Banknote },
    { href: "/subscription",   label: "Abonnement",    icon: CreditCard },
  ],
  ADMIN: [
    { href: "/admin",          label: "Dashboard",     icon: LayoutDashboard, exact: true },
    { href: "/admin/users",    label: "Utilisateurs",  icon: Users },
    { href: "/admin/properties",label:"Biens",         icon: Building2 },
    { href: "/admin/pipeline", label: "Pipeline",      icon: GitBranch },
    { href: "/admin/commissions",label:"Commissions",  icon: Banknote },
    { href: "/admin/contracts",label: "Contrats",      icon: FileText },
    { href: "/admin/logs",     label: "Logs",          icon: ScrollText },
  ],
};

// ── Composant ─────────────────────────────────────────────────
export function Sidebar() {
  const pathname   = usePathname();
  const { close }  = useSidebar();
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const role    = user?.role ?? "DEAL_FINDER";
  const navItems = NAV[role] ?? NAV.DEAL_FINDER;
  const roleLabel = ROLES[role as keyof typeof ROLES]?.label ?? role;

  const isActive = useCallback(
    (item: NavItem) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href),
    [pathname]
  );

  const copyReferralCode = async () => {
    if (!user?.referralCode) return;
    await navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="flex flex-col h-full bg-black w-64 select-none overflow-hidden">

      {/* ── Logo ────────────────────────────────────────────── */}
      <div className="shrink-0 px-5 py-5 border-b border-white/7">
        <Link href="/dashboard">
          <img src="/logo.svg" alt="Waseet logo" className="h-8 w-auto brightness-0 invert" />
        </Link>
      </div>

      {/* ── Bloc utilisateur ────────────────────────────────── */}
      <div className="shrink-0 border-b border-white/7 px-3 py-3">
        {user ? (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0"
              style={{ background: "linear-gradient(135deg,#C9973A,#E5B85C)" }}
            >
              {getInitials(user.firstName, user.lastName)}
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <Badge variant="gold" className="mt-0.5 text-[10px] py-0 px-1.5">
                {roleLabel}
              </Badge>
            </div>
          </div>
        ) : (
          /* Skeleton */
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-white/10 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/8 rounded w-1/2" />
            </div>
          </div>
        )}

        {/* Code parrainage */}
        {user?.referralCode && (
          <button
            onClick={copyReferralCode}
            className="mt-3 w-full flex items-center justify-between bg-white/6 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors group"
            title="Copier le code parrainage"
          >
            <div>
              <p className="text-white/40 text-[10px] leading-none mb-0.5">Code parrainage</p>
              <p className="text-[#635BFF] text-xs font-mono font-semibold">{user.referralCode}</p>
            </div>
            <span className="text-white/30 group-hover:text-[#635BFF] transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            </span>
          </button>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon   = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}   // ferme sidebar sur mobile
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 mb-0.5",
                active
                  ? "bg-[#635BFF]/15 text-[#635BFF] text-[13.5px] font-semibold"
                  : "text-white/50 text-[13.5px] font-normal hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-4.5 h-4.5 shrink-0 transition-colors",
                  active ? "text-[#635BFF]" : "text-charcoal"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <Badge variant="gold" dot>
                  {item.badge > 99 ? "99+" : item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="shrink-0 p-4 border-t border-white/7 space-y-0.5">
        {/* Déconnexion */}
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13.5px] font-normal text-white/40 hover:text-danger hover:bg-danger/10 transition-all duration-150"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
