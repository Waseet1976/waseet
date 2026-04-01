"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  FileText,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/properties", label: "Biens", icon: Building2 },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/deals", label: "Deals", icon: Handshake },
  { href: "/contracts", label: "Contrats", icon: FileText },
  { href: "/calendar", label: "Agenda", icon: Calendar },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/reports", label: "Rapports", icon: BarChart3 },
];

const bottomItems = [
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-obsidian flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard">
          <span className="text-2xl font-bold text-gradient-gold">Waseet</span>
          <span className="block text-xs text-sand/40 mt-0.5">Plateforme Immobilière</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-[#635BFF]/20 text-[#635BFF]"
                  : "text-sand/60 hover:text-sand hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", active && "text-[#635BFF]")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/10 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sand/60 hover:text-sand hover:bg-white/5 transition-all duration-200"
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger/80 hover:text-danger hover:bg-danger/10 transition-all duration-200 w-full">
          <LogOut className="h-5 w-5 flex-shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
