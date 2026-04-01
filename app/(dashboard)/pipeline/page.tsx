"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Star, RefreshCw, SlidersHorizontal, X } from "lucide-react";

import { useAuth }            from "@/lib/hooks/useAuth";
import { PIPELINE_STAGES }    from "@/lib/config";
import { formatPrice }        from "@/lib/utils";
import { cn }                 from "@/lib/utils/cn";
import type { PipelineStage } from "@prisma/client";

// ── Types ─────────────────────────────────────────────────────────────────────

interface KanbanProperty {
  id:             string;
  reference:      string;
  city:           string | null;
  neighborhood:   string | null;
  propertyType:   string | null;
  surfaceSqm:     number | null;
  estimatedPrice: number | null;
  country:        string | null;
  pipelineStage:  string;
  isPriority:     boolean;
  isDuplicate:    boolean;
  declaredAt:     string;
}

// ── Ordre des stages ──────────────────────────────────────────────────────────
const STAGE_ORDER = Object.keys(PIPELINE_STAGES) as PipelineStage[];

const TYPE_SHORT: Record<string, string> = {
  APARTMENT: "Appt", HOUSE: "Maison", VILLA: "Villa",
  LAND: "Terrain", COMMERCIAL: "Local", OFFICE: "Bureau",
  WAREHOUSE: "Entrepôt", OTHER: "Autre",
};

// ── Composant principal ───────────────────────────────────────────────────────

export default function PipelinePage() {
  const { user, isLoading } = useAuth();

  const [properties, setProperties] = useState<KanbanProperty[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtres
  const [filterCity, setFilterCity]   = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Drag & drop
  const [draggingId, setDraggingId]   = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const dragItemStage = useRef<string | null>(null);

  const canManage = user?.role === "ADMIN" || user?.role === "AGENCY";

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProperties = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else         setRefreshing(true);

    const token  = localStorage.getItem("waseet_token");
    const params = new URLSearchParams();
    if (filterCity) params.set("city", filterCity);

    const res = await fetch(`/api/properties?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const d = await res.json();
      setProperties(d.properties ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, [filterCity]);

  useEffect(() => {
    if (!isLoading && user) fetchProperties();
  }, [isLoading, user, fetchProperties]);

  // ── Grouper par stage ─────────────────────────────────────────────────────
  const grouped = STAGE_ORDER.reduce<Record<string, KanbanProperty[]>>((acc, stage) => {
    acc[stage] = properties.filter((p) => p.pipelineStage === stage);
    return acc;
  }, {});

  // ── Drag & drop handlers ──────────────────────────────────────────────────
  function handleDragStart(prop: KanbanProperty) {
    setDraggingId(prop.id);
    dragItemStage.current = prop.pipelineStage;
  }

  function handleDragOver(e: React.DragEvent, stage: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(stage);
  }

  function handleDragLeave() {
    setDragOverCol(null);
  }

  async function handleDrop(targetStage: string) {
    setDragOverCol(null);
    if (!draggingId || !canManage) { setDraggingId(null); return; }

    const property = properties.find((p) => p.id === draggingId);
    if (!property || property.pipelineStage === targetStage) {
      setDraggingId(null); return;
    }

    // Vérifier sens unique
    const curIdx = STAGE_ORDER.indexOf(property.pipelineStage as PipelineStage);
    const newIdx = STAGE_ORDER.indexOf(targetStage as PipelineStage);
    if (newIdx <= curIdx) { setDraggingId(null); return; }

    // Mise à jour optimiste
    setProperties((prev) =>
      prev.map((p) => p.id === draggingId ? { ...p, pipelineStage: targetStage } : p)
    );
    setDraggingId(null);

    const token = localStorage.getItem("waseet_token");
    const res = await fetch(`/api/properties/${draggingId}/pipeline`, {
      method:  "PATCH",
      headers: {
        "Content-Type":  "application/json",
        Authorization:   `Bearer ${token}`,
      },
      body: JSON.stringify({ newStage: targetStage }),
    });

    // Rollback si erreur
    if (!res.ok) {
      await fetchProperties(true);
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Erreur lors du déplacement");
    }
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverCol(null);
    dragItemStage.current = null;
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full -m-6">

      {/* ── En-tête ────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 bg-sand border-b border-sand-dark">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-obsidian">Vue pipeline</h1>
            <p className="text-xs text-charcoal-muted mt-0.5">
              {loading ? "Chargement…" : `${properties.length} bien(s) · Kanban`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Filtres */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium border transition-all",
                showFilters
                  ? "bg-[#635BFF]/10 border-[#635BFF]/40 text-[#635BFF]"
                  : "bg-white border-sand-dark text-charcoal-muted hover:text-charcoal"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtres
            </button>

            {/* Refresh */}
            <button
              onClick={() => fetchProperties(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium border bg-white border-sand-dark text-charcoal-muted hover:text-charcoal transition-all"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Barre de filtres */}
        {showFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                placeholder="Filtrer par ville…"
                className="h-8 bg-white border border-sand-dark rounded-xl px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#635BFF] placeholder:text-charcoal-muted"
              />
              {filterCity && (
                <button
                  onClick={() => setFilterCity("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-danger"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {!canManage && (
              <p className="text-xs text-charcoal-muted italic">
                Lecture seule — seuls ADMIN et AGENCY peuvent déplacer les biens
              </p>
            )}
            {canManage && (
              <p className="text-xs text-[#635BFF] italic">
                Glissez les cartes pour avancer le pipeline
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Kanban ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 h-full p-4 min-w-max">
          {STAGE_ORDER.map((stage) => {
            const cfg   = PIPELINE_STAGES[stage];
            const cards = grouped[stage] ?? [];
            const isOver = dragOverCol === stage;

            return (
              <div
                key={stage}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(stage)}
                className={cn(
                  "flex flex-col w-[210px] flex-shrink-0 rounded-2xl border-2 transition-all duration-150",
                  isOver
                    ? "border-[#635BFF] bg-[#635BFF]/5 scale-[1.01]"
                    : "border-sand-dark bg-sand"
                )}
              >
                {/* En-tête colonne */}
                <div className="p-3 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: cfg.color }}
                      />
                      <p
                        className="text-xs font-semibold leading-tight"
                        style={{ color: cfg.color }}
                      >
                        {cfg.label}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-white bg-charcoal-muted rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {cards.length}
                    </span>
                  </div>
                  {/* Barre de progression du stage */}
                  <div className="h-1 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cfg.progress}%`, background: cfg.color }}
                    />
                  </div>
                </div>

                {/* Cartes */}
                <div
                  className={cn(
                    "flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[60px]",
                    isOver && "bg-[#635BFF]/5 rounded-b-2xl"
                  )}
                >
                  {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-24 bg-white rounded-xl animate-pulse border border-sand-dark"
                      />
                    ))
                  ) : cards.length === 0 ? (
                    <div
                      className={cn(
                        "h-12 rounded-xl border-2 border-dashed flex items-center justify-center",
                        isOver ? "border-[#635BFF]/50" : "border-sand-dark/50"
                      )}
                    >
                      <p className="text-[10px] text-charcoal-muted">
                        {isOver ? "Déposer ici" : "Vide"}
                      </p>
                    </div>
                  ) : (
                    cards.map((p) => (
                      <KanbanCard
                        key={p.id}
                        property={p}
                        isDragging={draggingId === p.id}
                        canDrag={canManage}
                        onDragStart={() => handleDragStart(p)}
                        onDragEnd={handleDragEnd}
                        stageColor={cfg.color}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Carte Kanban ──────────────────────────────────────────────────────────────

function KanbanCard({
  property,
  isDragging,
  canDrag,
  onDragStart,
  onDragEnd,
  stageColor,
}: {
  property:   KanbanProperty;
  isDragging: boolean;
  canDrag:    boolean;
  onDragStart: () => void;
  onDragEnd:   () => void;
  stageColor:  string;
}) {
  return (
    <div
      draggable={canDrag}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "bg-white rounded-xl border border-sand-dark p-3",
        "transition-all duration-150 select-none",
        canDrag && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40 scale-95 rotate-1",
        !isDragging && "hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {/* Référence + priorité */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-mono font-bold text-[#635BFF]">
          {property.reference}
        </span>
        {property.isPriority && (
          <Star className="w-3 h-3 text-[#635BFF] fill-gold flex-shrink-0" />
        )}
      </div>

      {/* Ville */}
      <p className="text-xs font-semibold text-obsidian mb-0.5 leading-tight">
        {property.city ?? "—"}
        {property.neighborhood ? (
          <span className="text-charcoal-muted font-normal"> · {property.neighborhood}</span>
        ) : null}
      </p>

      {/* Type + surface */}
      <p className="text-[10px] text-charcoal-muted mb-2">
        {TYPE_SHORT[property.propertyType ?? ""] ?? property.propertyType}
        {property.surfaceSqm && ` · ${property.surfaceSqm} m²`}
      </p>

      {/* Prix */}
      {property.estimatedPrice && (
        <p className="text-xs font-bold text-charcoal mb-2">
          {formatPrice(property.estimatedPrice, "BE")}
        </p>
      )}

      {/* Barre de progression */}
      <div className="h-0.5 bg-sand-dark rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full"
          style={{
            width:      `${PIPELINE_STAGES[property.pipelineStage as PipelineStage].progress}%`,
            background: stageColor,
          }}
        />
      </div>

      {/* Lien détail */}
      <Link
        href={`/properties/${property.id}`}
        onClick={(e) => e.stopPropagation()}
        className="text-[10px] text-charcoal-muted hover:text-[#635BFF] transition-colors"
      >
        Voir le détail →
      </Link>
    </div>
  );
}
