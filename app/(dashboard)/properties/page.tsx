"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search, Star, LayoutList, Map, SlidersHorizontal,
  Building2, X, ChevronDown,
} from "lucide-react";

import { useAuth }          from "@/lib/hooks/useAuth";
import { Badge }            from "@/components/ui/Badge";
import { PropertiesMap }    from "@/components/maps/PropertiesMap";
import { PIPELINE_STAGES, PROPERTY_TYPES } from "@/lib/config";
import { formatPrice, formatRelativeDate } from "@/lib/utils";
import { cn }               from "@/lib/utils/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PropertyItem {
  id:             string;
  reference:      string;
  country:        string | null;
  city:           string | null;
  neighborhood:   string | null;
  address:        string | null;
  propertyType:   string | null;
  surfaceSqm:     number | null;
  estimatedPrice: number | null;
  pipelineStage:  string;
  adminStatus:    string;
  isPriority:     boolean;
  isDuplicate:    boolean;
  declaredAt:     string;
  latitude:       number | null;
  longitude:      number | null;
  photos:         string[];
}

// ── Stage → badge variant ─────────────────────────────────────────────────────
function stageBadge(stage: string): "success" | "gold" | "warning" | "muted" | "info" {
  const prog = PIPELINE_STAGES[stage as keyof typeof PIPELINE_STAGES]?.progress ?? 0;
  if (prog === 100) return "success";
  if (prog >= 57)   return "gold";
  if (prog >= 28)   return "warning";
  return "muted";
}

const TYPE_LABEL: Record<string, string> = {
  APARTMENT: "Appartement", HOUSE: "Maison", VILLA: "Villa",
  LAND: "Terrain", COMMERCIAL: "Commercial", OFFICE: "Bureau",
  WAREHOUSE: "Entrepôt", OTHER: "Autre",
};

// ── Composant ─────────────────────────────────────────────────────────────────

export default function PropertiesPage() {
  const { user, isLoading } = useAuth();
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState<"list" | "map">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  // Filtres
  const [q,        setQ]        = useState("");
  const [stage,    setStage]    = useState("");
  const [type,     setType]     = useState("");
  const [priority, setPriority] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProperties = useCallback(async () => {
    const token = localStorage.getItem("waseet_token");
    const params = new URLSearchParams();
    if (q)        params.set("q",        q);
    if (stage)    params.set("stage",    stage);
    if (type)     params.set("type",     type);
    if (priority) params.set("priority", "true");

    try {
      const res = await fetch(`/api/properties?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [q, stage, type, priority]);

  useEffect(() => {
    if (!isLoading && user) fetchProperties();
  }, [isLoading, user, fetchProperties]);

  // Scroll vers l'item sélectionné
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  const selectProperty = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    if (view === "list") setView("map");
  };

  const clearFilters = () => {
    setQ(""); setStage(""); setType(""); setPriority(false);
  };
  const hasFilters = q || stage || type || priority;

  const selectClass = cn(
    "h-9 bg-white text-obsidian text-sm border border-sand-dark rounded-xl px-3 pr-8",
    "focus:outline-none focus:ring-2 focus:ring-[#635BFF]/40 focus:border-[#635BFF]",
    "appearance-none cursor-pointer hover:border-charcoal-muted/50 transition-colors"
  );

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full -m-6">

      {/* ── Barre supérieure ──────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 bg-sand border-b border-sand-dark/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-obsidian">Biens immobiliers</h1>
            <p className="text-xs text-charcoal-muted mt-0.5">
              {loading ? "Chargement…" : `${properties.length} bien(s) trouvé(s)`}
            </p>
          </div>
          {/* Toggle vue */}
          <div className="flex items-center bg-white rounded-xl border border-sand-dark p-0.5 gap-0.5">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                view === "list" ? "bg-[#635BFF] text-white shadow-sm" : "text-charcoal-muted hover:text-charcoal"
              )}
            >
              <LayoutList className="w-3.5 h-3.5" />
              Liste
            </button>
            <button
              onClick={() => setView("map")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                view === "map" ? "bg-[#635BFF] text-white shadow-sm" : "text-charcoal-muted hover:text-charcoal"
              )}
            >
              <Map className="w-3.5 h-3.5" />
              Carte
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[180px] max-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Référence, ville, adresse…"
              className={cn(
                "w-full h-9 bg-white text-sm border border-sand-dark rounded-xl pl-8 pr-3",
                "focus:outline-none focus:ring-2 focus:ring-[#635BFF]/40 focus:border-[#635BFF] placeholder:text-charcoal-muted"
              )}
            />
          </div>

          {/* Stage */}
          <div className="relative">
            <select value={stage} onChange={(e) => setStage(e.target.value)} className={selectClass}>
              <option value="">Tous les stages</option>
              {Object.entries(PIPELINE_STAGES).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal-muted" />
          </div>

          {/* Type */}
          <div className="relative">
            <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
              <option value="">Tous les types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal-muted" />
          </div>

          {/* Prioritaires */}
          <button
            onClick={() => setPriority((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold border transition-all",
              priority
                ? "bg-[#635BFF]/10 border-[#635BFF]/50 text-[#635BFF]"
                : "bg-white border-sand-dark text-charcoal-muted hover:border-[#635BFF]/40 hover:text-[#635BFF]"
            )}
          >
            <Star className={cn("w-3.5 h-3.5", priority && "fill-gold")} />
            Prioritaires
          </button>

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 h-9 px-2.5 rounded-xl text-xs text-charcoal-muted hover:text-danger hover:bg-danger/5 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}

          {/* Déclarer */}
          <Link
            href="/declare"
            className="ml-auto flex items-center gap-1.5 h-9 px-4 bg-[#635BFF] hover:bg-[#4C45E0] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            + Déclarer un bien
          </Link>
        </div>
      </div>

      {/* ── Corps principal ───────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Colonne liste ──────────────────────────────────────────────── */}
        <div
          className={cn(
            "flex-shrink-0 overflow-y-auto bg-white border-r border-sand-dark",
            view === "map" ? "hidden md:block md:w-[380px]" : "w-full md:w-[380px]"
          )}
        >
          {loading ? (
            <div className="space-y-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border-b border-sand-dark animate-pulse">
                  <div className="h-3.5 bg-sand-dark rounded w-28 mb-2" />
                  <div className="h-4 bg-sand rounded w-3/4 mb-1.5" />
                  <div className="h-3 bg-sand rounded w-1/2 mb-3" />
                  <div className="h-2 bg-sand-dark rounded-full" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-sand flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-charcoal-muted" />
              </div>
              <p className="text-sm font-semibold text-charcoal mb-1">Aucun bien trouvé</p>
              <p className="text-xs text-charcoal-muted">
                {hasFilters ? "Modifiez vos filtres." : "Déclarez votre premier bien."}
              </p>
            </div>
          ) : (
            <div>
              {properties.map((p) => {
                const stageConfig = PIPELINE_STAGES[p.pipelineStage as keyof typeof PIPELINE_STAGES];
                const isSelected  = selectedId === p.id;

                return (
                  <div
                    key={p.id}
                    ref={isSelected ? selectedRef : null}
                    onClick={() => selectProperty(p.id)}
                    className={cn(
                      "p-4 border-b border-sand-dark/60 cursor-pointer transition-all select-none",
                      "hover:bg-sand/40",
                      isSelected && "bg-[#635BFF]/5 border-l-[3px] border-l-gold pl-[13px]"
                    )}
                  >
                    {/* Ligne 1: référence + priorité */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-mono font-bold text-[#635BFF]">
                        {p.reference}
                      </span>
                      {p.isPriority && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#635BFF]">
                          <Star className="w-3 h-3 fill-gold" />
                          Prioritaire
                        </span>
                      )}
                    </div>

                    {/* Ligne 2: ville + quartier */}
                    <p className="text-sm font-semibold text-obsidian mb-0.5">
                      {p.city}{p.neighborhood ? ` · ${p.neighborhood}` : ""}
                    </p>

                    {/* Ligne 3: type + surface */}
                    <p className="text-xs text-charcoal-muted mb-2">
                      {TYPE_LABEL[p.propertyType ?? ""] ?? p.propertyType}
                      {p.surfaceSqm && ` · ${p.surfaceSqm} m²`}
                    </p>

                    {/* Prix */}
                    {p.estimatedPrice && (
                      <p className="text-sm font-bold text-obsidian mb-2">
                        {formatPrice(p.estimatedPrice, "BE")}
                      </p>
                    )}

                    {/* Badge pipeline */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={stageBadge(p.pipelineStage)} className="text-[10px] py-0.5 px-2">
                        {stageConfig?.label ?? p.pipelineStage}
                      </Badge>
                      {p.isDuplicate && (
                        <span className="text-[10px] text-charcoal-muted">doublon</span>
                      )}
                    </div>

                    {/* Barre de progression */}
                    <div className="h-1 bg-sand-dark rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width:      `${stageConfig?.progress ?? 0}%`,
                          background: stageConfig?.color ?? "#6B7280",
                        }}
                      />
                    </div>

                    {/* Date */}
                    <p className="text-[10px] text-charcoal-muted">
                      {formatRelativeDate(p.declaredAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Colonne carte ──────────────────────────────────────────────── */}
        <div
          className={cn(
            "flex-1 min-w-0 p-4",
            view === "list" ? "hidden md:block" : "block"
          )}
        >
          <PropertiesMap
            properties={properties.filter((p): p is PropertyItem & { city: string } => p.city !== null)}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId((prev) => (prev === id ? null : id))}
            className="h-full rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
}
