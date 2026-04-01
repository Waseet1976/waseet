"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, UserCheck, UserX, RefreshCw, ChevronDown,
  Shield, Building2, User, Briefcase, MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ── Types ──────────────────────────────────────────────────────────────────────

interface UserItem {
  id:          string;
  email:       string;
  firstName:   string;
  lastName:    string;
  phone:       string | null;
  country:     string | null;
  role:        "ADMIN" | "AGENCY" | "AGENT" | "DEAL_FINDER";
  isActive:    boolean;
  createdAt:   string;
  agency:      { id: string; name: string } | null;
  agentProfile: { photo: string | null; fonction: string | null } | null;
  _count: { declaredProps: number; commissions: number; referrals: number };
}

interface Pagination {
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  ADMIN:       { label: "Admin",     color: "bg-danger/10 text-danger-dark",       icon: <Shield    className="w-3 h-3" /> },
  AGENCY:      { label: "Agence",    color: "bg-[#635BFF]/10 text-[#4C45E0]",           icon: <Building2 className="w-3 h-3" /> },
  AGENT:       { label: "Agent",     color: "bg-charcoal-muted/10 text-charcoal",  icon: <User      className="w-3 h-3" /> },
  DEAL_FINDER: { label: "Apporteur", color: "bg-[#635BFF]/15 text-[#4C45E0]",           icon: <Briefcase className="w-3 h-3" /> },
};

// ── Menu d'actions ────────────────────────────────────────────────────────────

function ActionMenu({
  user,
  onAction,
}: {
  user:     UserItem;
  onAction: (userId: string, action: string, role?: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  const roles: UserItem["role"][] = ["ADMIN", "AGENCY", "AGENT", "DEAL_FINDER"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-charcoal-muted hover:bg-sand transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-sand-dark rounded-xl shadow-lg py-1 w-48 text-sm">
            {/* Toggle activation */}
            <button
              onClick={() => { setOpen(false); onAction(user.id, user.isActive ? "deactivate" : "activate"); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-sand text-left transition-colors"
            >
              {user.isActive
                ? <><UserX className="w-3.5 h-3.5 text-red-500" /> <span>Désactiver</span></>
                : <><UserCheck className="w-3.5 h-3.5 text-emerald-500" /> <span>Activer</span></>
              }
            </button>

            <div className="border-t border-sand-dark my-1" />
            <p className="px-3 py-1 text-[10px] text-charcoal-muted font-medium uppercase tracking-wider">
              Changer le rôle
            </p>
            {roles.filter((r) => r !== user.role).map((r) => (
              <button
                key={r}
                onClick={() => { setOpen(false); onAction(user.id, "changeRole", r); }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-sand text-left transition-colors"
              >
                {ROLE_CONFIG[r].icon}
                <span>{ROLE_CONFIG[r].label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users,      setUsers]      = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [q,          setQ]          = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page,       setPage]       = useState(1);
  const [actionMsg,  setActionMsg]  = useState("");

  const load = useCallback(async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("waseet_token") ?? "";
      const qs    = new URLSearchParams({ page: String(p), limit: "20" });
      if (q)            qs.set("q", q);
      if (roleFilter)   qs.set("role", roleFilter);
      if (activeFilter) qs.set("isActive", activeFilter);

      const res = await fetch(`/api/admin/users?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      setUsers(data.users ?? []);
      setPagination(data.pagination ?? { total: 0, page: 1, limit: 20, pages: 1 });
    } catch {
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  }, [q, roleFilter, activeFilter, page]);

  useEffect(() => { setPage(1); }, [q, roleFilter, activeFilter]);
  useEffect(() => { load(page); }, [page, load]);

  async function handleAction(userId: string, action: string, role?: string) {
    try {
      const token = localStorage.getItem("waseet_token") ?? "";
      const res   = await fetch("/api/admin/users", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ userId, action, role }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Erreur");
      }
      setActionMsg("Modification enregistrée");
      setTimeout(() => setActionMsg(""), 3000);
      load(page);
    } catch (e: unknown) {
      setActionMsg(e instanceof Error ? e.message : "Erreur");
      setTimeout(() => setActionMsg(""), 4000);
    }
  }

  const roleOptions = [
    { value: "",            label: "Tous les rôles" },
    { value: "ADMIN",       label: "Admins" },
    { value: "AGENCY",      label: "Agences" },
    { value: "AGENT",       label: "Agents" },
    { value: "DEAL_FINDER", label: "Apporteurs" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-obsidian">Utilisateurs</h1>
          <p className="text-sm text-charcoal-muted mt-0.5">
            {pagination.total} utilisateur{pagination.total > 1 ? "s" : ""} au total
          </p>
        </div>
        <button
          onClick={() => load(page)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-sand-dark rounded-lg hover:bg-sand transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Confirmation action */}
      {actionMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
          {actionMsg}
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        {/* Recherche */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
          <input
            type="text"
            placeholder="Nom, email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-sand-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635BFF]/40"
          />
        </div>

        {/* Filtre rôle */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-white border border-sand-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635BFF]/40"
          >
            {roleOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal-muted pointer-events-none" />
        </div>

        {/* Filtre actif */}
        <div className="relative">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-white border border-sand-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635BFF]/40"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Actifs</option>
            <option value="false">Désactivés</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal-muted pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-[#635BFF] border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <p className="text-center text-sm text-charcoal-muted py-12">{error}</p>
      ) : (
        <div className="bg-white border border-sand-dark rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-dark bg-sand/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Rôle</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide hidden md:table-cell">Agence</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide hidden lg:table-cell">Biens</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide hidden lg:table-cell">Commissions</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide hidden md:table-cell">Inscrit</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-dark/60">
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-charcoal-muted text-sm">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
                {users.map((u) => {
                  const roleConf = ROLE_CONFIG[u.role];
                  return (
                    <tr key={u.id} className={cn("hover:bg-sand/30 transition-colors", !u.isActive && "opacity-60")}>
                      {/* Utilisateur */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                            u.isActive ? "bg-[#635BFF]/15 text-[#4C45E0]" : "bg-sand text-charcoal-muted"
                          )}>
                            {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-obsidian truncate">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-xs text-charcoal-muted truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Rôle */}
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                          roleConf.color
                        )}>
                          {roleConf.icon} {roleConf.label}
                        </span>
                      </td>

                      {/* Agence */}
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-charcoal-muted">
                        {u.agency?.name ?? "—"}
                      </td>

                      {/* Biens */}
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        <span className="text-sm font-semibold text-obsidian">{u._count.declaredProps}</span>
                      </td>

                      {/* Commissions */}
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        <span className="text-sm font-semibold text-obsidian">{u._count.commissions}</span>
                      </td>

                      {/* Date inscription */}
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-charcoal-muted">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                          u.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-sand text-charcoal-muted"
                        )}>
                          {u.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {u.isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <ActionMenu user={u} onAction={handleAction} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-sand-dark">
              <p className="text-xs text-charcoal-muted">
                {((page - 1) * pagination.limit) + 1}–{Math.min(page * pagination.limit, pagination.total)} sur {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-xs border border-sand-dark rounded-lg disabled:opacity-40 hover:bg-sand transition-colors"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages}
                  className="px-3 py-1.5 text-xs border border-sand-dark rounded-lg disabled:opacity-40 hover:bg-sand transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
