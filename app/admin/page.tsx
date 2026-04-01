"use client";

import { useEffect, useState } from "react";
import {
  Users, Building2, Coins, AlertTriangle, TrendingUp,
  Copy, CheckCircle2, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdminStats {
  kpis: {
    users:               Record<string, number>;
    propertiesTotal:     number;
    propertiesPending:   number;
    propertiesDuplicates: number;
    agenciesTotal:       number;
    commissions:         Record<string, { count: number; estimated: number; validated: number }>;
  };
  monthly: { label: string; declarations: number; sales: number; commissions: number }[];
  topApporteurs: { id: string; name: string; country: string | null; properties: number; totalEarned: number }[];
  geography: { country: string; count: number }[];
  alerts: { pendingDeclarations: number; duplicatesPending: number };
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon, color = "gold", alert = false,
}: {
  label:  string;
  value:  string | number;
  sub?:   string;
  icon:   React.ReactNode;
  color?: "gold" | "blue" | "green" | "amber" | "red";
  alert?: boolean;
}) {
  const palette = {
    gold:  "bg-[#635BFF]/10 text-[#635BFF]",
    blue:  "bg-[#635BFF]/10 text-[#635BFF]",
    green: "bg-success/10 text-success-dark",
    amber: "bg-warning-bg text-warning",
    red:   "bg-danger/10 text-danger-dark",
  };
  return (
    <div className={cn(
      "bg-white rounded-xl border p-5 relative",
      alert ? "border-warning/40" : "border-sand-dark"
    )}>
      {alert && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-warning animate-pulse" />
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-charcoal-muted font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-obsidian">{value}</p>
          {sub && <p className="text-xs text-charcoal-muted mt-0.5">{sub}</p>}
        </div>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", palette[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Bar chart SVG ─────────────────────────────────────────────────────────────

function BarChart({
  data, valueKey, color, label,
}: {
  data:     { label: string; [k: string]: unknown }[];
  valueKey: string;
  color:    string;
  label:    string;
}) {
  const values = data.map((d) => (d[valueKey] as number) || 0);
  const max    = Math.max(...values, 1);
  const H = 100;
  const barW = 24;
  const gap  = 8;
  const W    = data.length * (barW + gap) - gap;

  return (
    <div>
      <p className="text-xs font-medium text-charcoal-muted mb-3">{label}</p>
      <svg viewBox={`0 0 ${W + 2} ${H + 24}`} className="w-full">
        {data.map((d, i) => {
          const v = (d[valueKey] as number) || 0;
          const h = (v / max) * H;
          const x = i * (barW + gap);
          return (
            <g key={i}>
              <rect
                x={x} y={H - h} width={barW} height={h}
                rx={3} fill={color} opacity={0.85}
              />
              <text
                x={x + barW / 2} y={H + 14}
                textAnchor="middle" fontSize={8} fill="#9CA3AF"
              >
                {d.label}
              </text>
              {v > 0 && (
                <text
                  x={x + barW / 2} y={H - h - 4}
                  textAnchor="middle" fontSize={8} fill={color}
                >
                  {v}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [stats,   setStats]   = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("waseet_token") ?? "";
      const res   = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json() as AdminStats;
      setStats(data);
    } catch {
      setError("Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-[#635BFF] border-t-transparent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center gap-3 h-64 justify-center text-charcoal-muted">
      <p className="text-sm">{error}</p>
      <button onClick={load} className="text-sm text-[#635BFF] hover:underline">Réessayer</button>
    </div>
  );

  if (!stats) return null;

  const { kpis, monthly, topApporteurs, geography, alerts } = stats;

  const totalUsers = Object.values(kpis.users).reduce((a, b) => a + b, 0);
  const commPaid   = kpis.commissions["PAID"];
  const commVal    = kpis.commissions["VALIDATED"];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-obsidian">Tableau de bord</h1>
          <p className="text-sm text-charcoal-muted mt-0.5">Vue globale de la plateforme Waseet</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-sand-dark rounded-lg hover:bg-sand transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Alertes */}
      {(alerts.pendingDeclarations > 0 || alerts.duplicatesPending > 0) && (
        <div className="bg-warning-bg border border-warning/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-charcoal">Actions requises</p>
            {alerts.pendingDeclarations > 0 && (
              <p className="text-xs text-charcoal-muted">
                {alerts.pendingDeclarations} déclaration{alerts.pendingDeclarations > 1 ? "s" : ""} en attente depuis plus de 48h
              </p>
            )}
            {alerts.duplicatesPending > 0 && (
              <p className="text-xs text-charcoal-muted">
                {alerts.duplicatesPending} doublon{alerts.duplicatesPending > 1 ? "s" : ""} à examiner
              </p>
            )}
          </div>
        </div>
      )}

      {/* KPIs ligne 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Utilisateurs total"
          value={totalUsers}
          sub={`${kpis.users["DEAL_FINDER"] ?? 0} apporteurs`}
          icon={<Users className="w-4 h-4" />}
          color="blue"
        />
        <KpiCard
          label="Biens déclarés"
          value={kpis.propertiesTotal}
          sub={`${kpis.propertiesPending} en attente`}
          icon={<Building2 className="w-4 h-4" />}
          color="gold"
          alert={kpis.propertiesPending > 0}
        />
        <KpiCard
          label="Doublons à traiter"
          value={kpis.propertiesDuplicates}
          icon={<Copy className="w-4 h-4" />}
          color={kpis.propertiesDuplicates > 0 ? "amber" : "green"}
          alert={kpis.propertiesDuplicates > 0}
        />
        <KpiCard
          label="Agences actives"
          value={kpis.agenciesTotal}
          icon={<Building2 className="w-4 h-4" />}
          color="green"
        />
      </div>

      {/* KPIs commissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KpiCard
          label="Commissions estimées"
          value={(kpis.commissions["ESTIMATED"]?.estimated ?? 0).toLocaleString("fr-FR") + " €"}
          sub={`${kpis.commissions["ESTIMATED"]?.count ?? 0} dossiers`}
          icon={<Coins className="w-4 h-4" />}
          color="amber"
        />
        <KpiCard
          label="Commissions validées"
          value={(commVal?.validated ?? 0).toLocaleString("fr-FR") + " €"}
          sub={`${commVal?.count ?? 0} dossiers`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="blue"
        />
        <KpiCard
          label="Commissions payées"
          value={(commPaid?.validated ?? 0).toLocaleString("fr-FR") + " €"}
          sub={`${commPaid?.count ?? 0} dossiers`}
          icon={<TrendingUp className="w-4 h-4" />}
          color="green"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-sand-dark rounded-xl p-5">
          <h2 className="text-sm font-semibold text-obsidian mb-4">Activité mensuelle</h2>
          <BarChart data={monthly} valueKey="declarations" color="#C9973A" label="Déclarations (6 mois)" />
        </div>
        <div className="bg-white border border-sand-dark rounded-xl p-5">
          <h2 className="text-sm font-semibold text-obsidian mb-4">Ventes conclues</h2>
          <BarChart data={monthly} valueKey="sales" color="#3A8A5A" label="Ventes par mois" />
        </div>
      </div>

      {/* Top apporteurs + géographie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top apporteurs */}
        <div className="bg-white border border-sand-dark rounded-xl p-5">
          <h2 className="text-sm font-semibold text-obsidian mb-4">Top apporteurs</h2>
          <div className="space-y-3">
            {topApporteurs.length === 0 && (
              <p className="text-sm text-charcoal-muted text-center py-4">Aucun apporteur</p>
            )}
            {topApporteurs.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  i === 0 ? "bg-[#635BFF] text-obsidian" :
                  i === 1 ? "bg-charcoal-muted/20 text-charcoal-muted" :
                            "bg-sand text-charcoal-muted"
                )}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-obsidian truncate">{a.name}</p>
                  <p className="text-xs text-charcoal-muted">{a.properties} bien{a.properties > 1 ? "s" : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-obsidian">
                    {a.totalEarned.toLocaleString("fr-FR")} {a.country === "BE" ? "€" : "DH"}
                  </p>
                  <p className="text-[10px] text-charcoal-muted">gagné</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition géographique */}
        <div className="bg-white border border-sand-dark rounded-xl p-5">
          <h2 className="text-sm font-semibold text-obsidian mb-4">Répartition géographique</h2>
          <div className="space-y-3">
            {geography.length === 0 && (
              <p className="text-sm text-charcoal-muted text-center py-4">Aucune donnée</p>
            )}
            {geography.map((g) => {
              const pct = kpis.propertiesTotal > 0
                ? Math.round((g.count / kpis.propertiesTotal) * 100)
                : 0;
              return (
                <div key={g.country}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-obsidian">
                      {g.country === "MA" ? "🇲🇦 Maroc" :
                       g.country === "BE" ? "🇧🇪 Belgique" : g.country}
                    </span>
                    <span className="text-sm font-semibold text-obsidian">
                      {g.count} <span className="text-charcoal-muted font-normal text-xs">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-sand-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#635BFF] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rôles utilisateurs */}
      <div className="bg-white border border-sand-dark rounded-xl p-5">
        <h2 className="text-sm font-semibold text-obsidian mb-4">Répartition des rôles</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: "ADMIN",       label: "Admins",     color: "bg-danger/10 text-danger-dark" },
            { key: "AGENCY",      label: "Agences",    color: "bg-[#635BFF]/10 text-[#4C45E0]" },
            { key: "AGENT",       label: "Agents",     color: "bg-charcoal-muted/10 text-charcoal" },
            { key: "DEAL_FINDER", label: "Apporteurs", color: "bg-[#635BFF]/15 text-[#4C45E0]" },
          ].map((r) => (
            <div key={r.key} className={cn("rounded-lg px-4 py-3 text-center", r.color)}>
              <p className="text-2xl font-bold">{kpis.users[r.key] ?? 0}</p>
              <p className="text-xs font-medium mt-0.5">{r.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
