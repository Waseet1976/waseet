"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  GitBranch, Building2, Star, AlertTriangle,
  Search, ExternalLink,
} from "lucide-react";

import { Badge }              from "@/components/ui/Badge";
import { Card, CardBody }     from "@/components/ui/Card";
import { PIPELINE_STAGES }   from "@/lib/config";
import { formatPrice, formatRelativeDate } from "@/lib/utils";
import { cn }                 from "@/lib/utils/cn";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PipelineProperty {
  id:            string;
  reference:     string;
  propertyType:  string | null;
  city:          string | null;
  estimatedPrice:number | null;
  pipelineStage: string;
  adminStatus:   string;
  isPriority:    boolean;
  isDuplicate:   boolean;
  declaredAt:    string;
  updatedAt:     string;
  declaredBy:    { firstName: string; lastName: string } | null;
  agency:        { name: string } | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  APARTMENT: "Appartement", HOUSE: "Maison", VILLA: "Villa",
  LAND: "Terrain", COMMERCIAL: "Commercial", OFFICE: "Bureau",
  WAREHOUSE: "Entrepôt", OTHER: "Autre",
};

const STAGE_TABS = [
  { key: "", label: "Tous" },
  ...Object.entries(PIPELINE_STAGES).map(([key, cfg]) => ({
    key, label: cfg.label,
  })),
];

// ── Composant ─────────────────────────────────────────────────────────────────

export default function AdminPipelinePage() {
  const [properties, setProperties] = useState<PipelineProperty[]>([]);
  const [counts,     setCounts]     = useState<Record<string, number>>({});
  const [loading,    setLoading]    = useState(true);
  const [stage,      setStage]      = useState("");
  const [q,          setQ]          = useState("");
  const [search,     setSearch]     = useState("");

  const fetchData = useCallback(async (stageFilter: string, qFilter: string) => {
    setLoading(true);
    const token  = localStorage.getItem("waseet_token");
    const params = new URLSearchParams();
    if (stageFilter) params.set("stage", stageFilter);
    if (qFilter)     params.set("q",     qFilter);

    const res = await fetch(`/api/admin/pipeline?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const d = await res.json();
      setProperties(d.properties ?? []);
      if (!stageFilter && !qFilter) setCounts(d.counts ?? {});
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(stage, search); }, [stage, search, fetchData]);

  const total = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <div className="space-y-6">

      {/* ── En-tête ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-obsidian flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-[#635BFF]" />
            Pipeline
          </h1>
          <p className="text-sm text-charcoal-muted mt-0.5">
            Vue globale de l'avancement des biens — {total} bien{total !== 1 ? "s" : ""} au total
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(q)}
            placeholder="Réf., ville, propriétaire…"
            className="w-full h-9 pl-9 pr-3 text-sm border border-sand-dark rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30"
          />
        </div>
      </div>

      {/* ── Cartes KPI par étape ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(PIPELINE_STAGES).map(([key, cfg]) => {
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              onClick={() => setStage(stage === key ? "" : key)}
              className={cn(
                "text-left p-3.5 rounded-xl border-2 transition-all",
                stage === key
                  ? "border-[#635BFF] bg-[#635BFF]/8 shadow-sm"
                  : "border-sand-dark bg-white hover:border-[#635BFF]/40"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                <span className="text-lg font-bold text-obsidian">{count}</span>
              </div>
              <p className="text-xs font-medium text-charcoal leading-tight">{cfg.label}</p>
              <div className="mt-2 h-1 bg-sand-dark rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${cfg.progress}%`, backgroundColor: cfg.color }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Onglets filtres ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-sand-dark/40 shadow-card overflow-hidden">
        <div className="flex border-b border-sand-dark overflow-x-auto">
          {STAGE_TABS.map((t) => {
            const count = t.key ? (counts[t.key] ?? 0) : total;
            return (
              <button
                key={t.key}
                onClick={() => { setStage(t.key); setSearch(""); setQ(""); }}
                className={cn(
                  "px-4 py-3 text-xs font-medium whitespace-nowrap transition-all border-b-2 -mb-px flex items-center gap-1.5",
                  stage === t.key && !search
                    ? "border-[#635BFF] text-[#635BFF] bg-[#635BFF]/5"
                    : "border-transparent text-charcoal-muted hover:text-charcoal"
                )}
              >
                {t.label}
                {count > 0 && (
                  <span className="bg-sand-dark text-charcoal-muted text-[10px] px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border-b border-sand-dark animate-pulse">
                  <div className="h-4 bg-sand rounded w-28" />
                  <div className="h-4 bg-sand rounded w-32 flex-1" />
                  <div className="h-4 bg-sand rounded w-24" />
                  <div className="h-4 bg-sand rounded w-32" />
                  <div className="h-4 bg-sand rounded w-28" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-charcoal-muted" />
              </div>
              <p className="text-sm font-semibold text-charcoal mb-1">Aucun bien trouvé</p>
              <p className="text-xs text-charcoal-muted">
                {stage || search ? "Essayez d'autres filtres." : "Aucun bien déclaré pour l'instant."}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-dark bg-sand/40">
                  <Th>Référence</Th>
                  <Th>Bien</Th>
                  <Th>Prix estimé</Th>
                  <Th>Apporteur</Th>
                  <Th>Agence</Th>
                  <Th>Étape</Th>
                  <Th>Statut admin</Th>
                  <Th>Dernière MÀJ</Th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => {
                  const stageCfg = PIPELINE_STAGES[p.pipelineStage as keyof typeof PIPELINE_STAGES];
                  return (
                    <tr key={p.id} className="border-b border-sand-dark/50 hover:bg-sand/30 transition-colors">

                      {/* Référence */}
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/declarations`}
                          className="font-mono font-bold text-[#635BFF] hover:text-[#4C45E0] flex items-center gap-1 transition-colors"
                        >
                          {p.reference}
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </Link>
                        <div className="flex items-center gap-1 mt-0.5">
                          {p.isPriority  && <Star className="w-3 h-3 text-[#635BFF] fill-gold" />}
                          {p.isDuplicate && <AlertTriangle className="w-3 h-3 text-warning" />}
                        </div>
                      </td>

                      {/* Bien */}
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-obsidian">{p.city ?? "—"}</p>
                        <p className="text-xs text-charcoal-muted">
                          {TYPE_LABEL[p.propertyType ?? ""] ?? p.propertyType ?? "—"}
                        </p>
                      </td>

                      {/* Prix */}
                      <td className="px-4 py-3.5 font-medium text-charcoal whitespace-nowrap">
                        {p.estimatedPrice ? formatPrice(p.estimatedPrice, "BE") : <span className="text-charcoal-muted">—</span>}
                      </td>

                      {/* Apporteur */}
                      <td className="px-4 py-3.5 text-charcoal whitespace-nowrap">
                        {p.declaredBy
                          ? `${p.declaredBy.firstName} ${p.declaredBy.lastName}`
                          : <span className="text-charcoal-muted">—</span>}
                      </td>

                      {/* Agence */}
                      <td className="px-4 py-3.5 text-charcoal">
                        {p.agency?.name ?? <span className="text-charcoal-muted">—</span>}
                      </td>

                      {/* Étape */}
                      <td className="px-4 py-3.5">
                        {stageCfg ? (
                          <div>
                            <span className="text-xs font-semibold" style={{ color: stageCfg.color }}>
                              {stageCfg.label}
                            </span>
                            <div className="mt-1 h-1.5 w-24 bg-sand-dark rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${stageCfg.progress}%`, backgroundColor: stageCfg.color }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-charcoal-muted text-xs">{p.pipelineStage}</span>
                        )}
                      </td>

                      {/* Statut admin */}
                      <td className="px-4 py-3.5">
                        {p.adminStatus === "VALIDATED" && <Badge variant="success">Validé</Badge>}
                        {p.adminStatus === "REJECTED"  && <Badge variant="danger">Rejeté</Badge>}
                        {p.adminStatus === "PENDING"   && <Badge variant="warning">En attente</Badge>}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-xs text-charcoal-muted whitespace-nowrap">
                        {formatRelativeDate(p.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
