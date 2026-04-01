"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2, Coins, RefreshCw,
  Search, DollarSign, Clock, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CommissionItem {
  id:              string;
  status:          "ESTIMATED" | "VALIDATED" | "PAID";
  estimatedAmount: number | null;
  validatedAmount: number | null;
  paidAt:          string | null;
  createdAt:       string;
  property: {
    id:        string;
    reference: string;
    city:      string | null;
    country:   string | null;
  };
  apporteur: {
    id:        string;
    firstName: string;
    lastName:  string;
    email:     string;
  } | null;
  agency: {
    id:   string;
    name: string;
  } | null;
}

interface CommissionStats {
  ESTIMATED?: { count: number; total: number };
  VALIDATED?: { count: number; total: number };
  PAID?:      { count: number; total: number };
}

// ── Modales ───────────────────────────────────────────────────────────────────

function ValidateModal({
  commission,
  onClose,
  onDone,
}: {
  commission: CommissionItem;
  onClose:    () => void;
  onDone:     () => void;
}) {
  const [amount,  setAmount]  = useState(String(commission.estimatedAmount ?? ""));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function submit() {
    const v = parseFloat(amount);
    if (isNaN(v) || v <= 0) { setError("Montant invalide"); return; }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("waseet_token") ?? "";
      const res   = await fetch(`/api/commissions/${commission.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ action: "validate", amount: v }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Erreur");
      }
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  const currency = "€";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
        <div>
          <h3 className="text-base font-semibold text-obsidian">Valider la commission</h3>
          <p className="text-sm text-charcoal-muted mt-0.5">{commission.property.reference}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-obsidian mb-1.5 block">
            Montant validé ({currency})
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 text-sm border border-sand-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635BFF]/50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-charcoal-muted font-medium">
              {currency}
            </span>
          </div>
          {commission.estimatedAmount && (
            <p className="text-xs text-charcoal-muted mt-1">
              Estimé : {commission.estimatedAmount.toLocaleString("fr-FR")} {currency}
            </p>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm border border-sand-dark rounded-xl hover:bg-sand transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#635BFF] hover:bg-[#4C45E0] text-white rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "En cours…" : "Valider"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PayModal({
  commission,
  onClose,
  onDone,
}: {
  commission: CommissionItem;
  onClose:    () => void;
  onDone:     () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("waseet_token") ?? "";
      const res   = await fetch(`/api/commissions/${commission.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ action: "pay" }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Erreur");
      }
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  const currency = "€";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
        <div>
          <h3 className="text-base font-semibold text-obsidian">Confirmer le paiement</h3>
          <p className="text-sm text-charcoal-muted mt-0.5">{commission.property.reference}</p>
        </div>

        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-xs text-charcoal-muted mb-1">Montant à payer</p>
          <p className="text-2xl font-bold text-emerald-700">
            {(commission.validatedAmount ?? 0).toLocaleString("fr-FR")} {currency}
          </p>
          <p className="text-xs text-charcoal-muted mt-1">
            À {commission.apporteur?.firstName ?? "—"} {commission.apporteur?.lastName ?? ""}
          </p>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm border border-sand-dark rounded-xl hover:bg-sand transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "En cours…" : "Confirmer paiement"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function AdminCommissionsPage() {
  const [items,          setItems]         = useState<CommissionItem[]>([]);
  const [stats,          setStats]         = useState<CommissionStats>({});
  const [loading,        setLoading]       = useState(true);
  const [error,          setError]         = useState("");
  const [statusFilter,   setStatusFilter]  = useState("");
  const [q,              setQ]             = useState("");
  const [validateTarget, setValidateTarget] = useState<CommissionItem | null>(null);
  const [payTarget,      setPayTarget]     = useState<CommissionItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("waseet_token") ?? "";
      const qs    = new URLSearchParams({ limit: "50" });
      if (statusFilter) qs.set("status", statusFilter);

      const res = await fetch(`/api/commissions?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      setItems(data.commissions ?? []);

      // Construire les stats depuis la réponse
      const raw: CommissionStats = {};
      for (const c of (data.commissions ?? []) as CommissionItem[]) {
        if (!raw[c.status]) raw[c.status] = { count: 0, total: 0 };
        raw[c.status]!.count++;
        raw[c.status]!.total += c.validatedAmount ?? c.estimatedAmount ?? 0;
      }
      setStats(raw);
    } catch {
      setError("Impossible de charger les commissions.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  function handleDone() {
    setValidateTarget(null);
    setPayTarget(null);
    load();
  }

  const filtered = q
    ? items.filter((c) =>
        c.property.reference.toLowerCase().includes(q.toLowerCase()) ||
        `${c.apporteur?.firstName ?? ""} ${c.apporteur?.lastName ?? ""}`.toLowerCase().includes(q.toLowerCase()) ||
        (c.apporteur?.email ?? "").toLowerCase().includes(q.toLowerCase())
      )
    : items;

  const STATUS_TABS = [
    { value: "",          label: "Toutes",    icon: <Coins        className="w-3.5 h-3.5" /> },
    { value: "ESTIMATED", label: "Estimées",  icon: <Clock        className="w-3.5 h-3.5" /> },
    { value: "VALIDATED", label: "Validées",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { value: "PAID",      label: "Payées",    icon: <TrendingUp   className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-obsidian">Commissions</h1>
          <p className="text-sm text-charcoal-muted mt-0.5">Gérez les commissions des apporteurs</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-sand-dark rounded-lg hover:bg-sand transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: "ESTIMATED", label: "Estimées", color: "text-warning",    bg: "bg-warning-bg border-warning/20",   icon: <Clock className="w-4 h-4 text-warning" /> },
          { key: "VALIDATED", label: "Validées", color: "text-[#635BFF]",      bg: "bg-[#635BFF]/8 border-[#635BFF]/20",         icon: <CheckCircle2 className="w-4 h-4 text-[#635BFF]" /> },
          { key: "PAID",      label: "Payées",   color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
        ].map((s) => {
          const d = stats[s.key as keyof CommissionStats];
          return (
            <div key={s.key} className={cn("rounded-xl border p-4", s.bg)}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-charcoal-muted">{s.label}</p>
                {s.icon}
              </div>
              <p className={cn("text-xl font-bold", s.color)}>
                {(d?.total ?? 0).toLocaleString("fr-FR")}
              </p>
              <p className="text-xs text-charcoal-muted">{d?.count ?? 0} dossier{(d?.count ?? 0) > 1 ? "s" : ""}</p>
            </div>
          );
        })}
      </div>

      {/* Onglets + recherche */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-white border border-sand-dark rounded-xl p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setStatusFilter(t.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors font-medium",
                statusFilter === t.value
                  ? "bg-obsidian text-white"
                  : "text-charcoal-muted hover:bg-sand"
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
          <input
            type="text"
            placeholder="Référence, apporteur…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-sand-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635BFF]/40"
          />
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Bien</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Apporteur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide hidden md:table-cell">Agence</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Estimé</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Validé</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-dark/60">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-charcoal-muted text-sm">
                      Aucune commission trouvée
                    </td>
                  </tr>
                )}
                {filtered.map((c) => {
                  const currency = c.property.country === "BE" ? "€" : "DH";
                  return (
                    <tr key={c.id} className="hover:bg-sand/30 transition-colors">
                      {/* Bien */}
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-bold text-[#635BFF]">{c.property.reference}</p>
                        {c.property.city && (
                          <p className="text-xs text-charcoal-muted">{c.property.city}</p>
                        )}
                      </td>

                      {/* Apporteur */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-obsidian text-xs">
                          {c.apporteur?.firstName ?? "—"} {c.apporteur?.lastName ?? ""}
                        </p>
                        <p className="text-xs text-charcoal-muted">{c.apporteur?.email ?? "—"}</p>
                      </td>

                      {/* Agence */}
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-charcoal-muted">
                        {c.agency?.name ?? "—"}
                      </td>

                      {/* Montant estimé */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-obsidian">
                          {c.estimatedAmount ? `${c.estimatedAmount.toLocaleString("fr-FR")} ${currency}` : "—"}
                        </span>
                      </td>

                      {/* Montant validé */}
                      <td className="px-4 py-3 text-right">
                        <span className={cn(
                          "text-sm font-semibold",
                          c.validatedAmount ? "text-[#4C45E0]" : "text-charcoal-muted"
                        )}>
                          {c.validatedAmount ? `${c.validatedAmount.toLocaleString("fr-FR")} ${currency}` : "—"}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "text-[11px] font-medium px-2 py-0.5 rounded-full",
                          c.status === "ESTIMATED" ? "bg-warning-bg text-warning" :
                          c.status === "VALIDATED" ? "bg-[#635BFF]/10 text-[#4C45E0]"   :
                                                      "bg-emerald-100 text-emerald-700"
                        )}>
                          {c.status === "ESTIMATED" ? "Estimée" :
                           c.status === "VALIDATED" ? "Validée" : "Payée"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-charcoal-muted">
                        {c.paidAt
                          ? new Date(c.paidAt).toLocaleDateString("fr-FR")
                          : new Date(c.createdAt).toLocaleDateString("fr-FR")}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {c.status === "ESTIMATED" && (
                            <button
                              onClick={() => setValidateTarget(c)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-[#635BFF] hover:bg-[#4C45E0] text-white rounded-lg transition-colors"
                            >
                              Valider
                            </button>
                          )}
                          {c.status === "VALIDATED" && (
                            <button
                              onClick={() => setPayTarget(c)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                            >
                              Payer
                            </button>
                          )}
                          {c.status === "PAID" && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      {validateTarget && (
        <ValidateModal commission={validateTarget} onClose={() => setValidateTarget(null)} onDone={handleDone} />
      )}
      {payTarget && (
        <PayModal commission={payTarget} onClose={() => setPayTarget(null)} onDone={handleDone} />
      )}
    </div>
  );
}
