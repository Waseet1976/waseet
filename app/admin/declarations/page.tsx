"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2, XCircle, Clock, MapPin, User,
  ChevronDown, RefreshCw, Eye, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Declaration {
  id:            string;
  reference:     string;
  city:          string | null;
  country:       string | null;
  propertyType:  string | null;
  estimatedPrice: number | null;
  adminStatus:   "PENDING" | "VALIDATED" | "REJECTED";
  pipelineStage: string;
  isDuplicate:   boolean;
  createdAt:     string;
  declaredBy: {
    id:        string;
    firstName: string;
    lastName:  string;
    email:     string;
    role:      string;
  } | null;
  internalNotes: string | null;
}

// ── Composants utilitaires ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Declaration["adminStatus"] }) {
  const map = {
    PENDING:   "bg-warning-bg text-warning border-warning/30",
    VALIDATED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    REJECTED:  "bg-red-100 text-red-700 border-red-200",
  };
  const labels = { PENDING: "En attente", VALIDATED: "Validé", REJECTED: "Refusé" };
  return (
    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", map[status])}>
      {labels[status]}
    </span>
  );
}

function ActionModal({
  property,
  onClose,
  onDone,
}: {
  property: Declaration;
  onClose:  () => void;
  onDone:   () => void;
}) {
  const [action, setAction]   = useState<"validate" | "reject">("validate");
  const [note,   setNote]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("waseet_token") ?? "";
      const res   = await fetch("/api/admin/validate-property", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ propertyId: property.id, action, note: note || undefined }),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div>
          <h3 className="text-base font-semibold text-obsidian">Valider la déclaration</h3>
          <p className="text-sm text-charcoal-muted mt-0.5">{property.reference}</p>
        </div>

        {/* Action */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setAction("validate")}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors",
              action === "validate"
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "border-sand-dark text-charcoal-muted hover:bg-sand"
            )}
          >
            <CheckCircle2 className="w-4 h-4" /> Valider
          </button>
          <button
            onClick={() => setAction("reject")}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors",
              action === "reject"
                ? "bg-red-50 border-red-300 text-red-700"
                : "border-sand-dark text-charcoal-muted hover:bg-sand"
            )}
          >
            <XCircle className="w-4 h-4" /> Refuser
          </button>
        </div>

        {/* Note */}
        <div>
          <label className="text-xs font-medium text-obsidian mb-1 block">
            Note interne {action === "reject" && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={action === "reject" ? "Motif du refus…" : "Commentaire optionnel…"}
            className="w-full text-sm border border-sand-dark rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#635BFF]/50"
          />
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
            disabled={loading || (action === "reject" && !note.trim())}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors",
              action === "validate"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                : "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            )}
          >
            {loading ? "En cours…" : action === "validate" ? "Confirmer validation" : "Confirmer refus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function DeclarationsPage() {
  const [items,       setItems]     = useState<Declaration[]>([]);
  const [loading,     setLoading]   = useState(true);
  const [error,       setError]     = useState("");
  const [filter,      setFilter]    = useState<"PENDING" | "VALIDATED" | "REJECTED" | "">( "PENDING");
  const [selected,    setSelected]  = useState<Declaration | null>(null);
  const [expandedId,  setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("waseet_token") ?? "";
      const qs    = filter ? `?adminStatus=${filter}&limit=50` : "?limit=50";
      const res   = await fetch(`/api/properties${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      setItems(data.properties ?? []);
    } catch {
      setError("Impossible de charger les déclarations.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  function handleDone() {
    setSelected(null);
    load();
  }

  const tabs: { value: "" | "PENDING" | "VALIDATED" | "REJECTED"; label: string; color: string }[] = [
    { value: "PENDING",   label: "En attente", color: "text-warning" },
    { value: "VALIDATED", label: "Validées",   color: "text-emerald-600" },
    { value: "REJECTED",  label: "Refusées",   color: "text-red-600" },
    { value: "",          label: "Toutes",     color: "text-charcoal-muted" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-obsidian">Déclarations</h1>
          <p className="text-sm text-charcoal-muted mt-0.5">Examinez et validez les biens déclarés</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-sand-dark rounded-lg hover:bg-sand transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-white border border-sand-dark rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={cn(
              "px-4 py-2 text-sm rounded-lg transition-colors font-medium",
              filter === t.value
                ? "bg-obsidian text-white"
                : "text-charcoal-muted hover:bg-sand"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-[#635BFF] border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-12 text-charcoal-muted text-sm">{error}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
          <p className="text-sm text-charcoal-muted">Aucune déclaration dans cette catégorie</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => {
            const expanded = expandedId === item.id;
            const age = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 3600));
            const urgent = item.adminStatus === "PENDING" && age >= 48;

            return (
              <div
                key={item.id}
                className={cn(
                  "bg-white border rounded-xl overflow-hidden transition-all",
                  urgent ? "border-warning/40" : "border-sand-dark"
                )}
              >
                {/* Header row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {urgent && (
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-mono font-semibold text-[#635BFF]">{item.reference}</span>
                      <StatusBadge status={item.adminStatus} />
                      {item.isDuplicate && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded-full font-medium">
                          Doublon
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-muted">
                      {item.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.city}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.declaredBy ? `${item.declaredBy.firstName} ${item.declaredBy.lastName}` : "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                        {urgent && <span className="text-warning font-medium ml-1">({age}h)</span>}
                      </span>
                      {item.estimatedPrice && (
                        <span className="font-medium text-obsidian">
                          {item.estimatedPrice.toLocaleString("fr-FR")} €
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/properties/${item.id}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-charcoal-muted hover:bg-sand transition-colors"
                      title="Voir le bien"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {item.adminStatus === "PENDING" && (
                      <button
                        onClick={() => setSelected(item)}
                        className="px-3 py-1.5 text-xs font-semibold bg-obsidian text-white rounded-lg hover:bg-charcoal-dark transition-colors"
                      >
                        Traiter
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(expanded ? null : item.id)}
                      className="p-1.5 rounded-lg text-charcoal-muted hover:bg-sand transition-colors"
                    >
                      <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
                    </button>
                  </div>
                </div>

                {/* Détails expand */}
                {expanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-sand-dark space-y-2">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      {item.propertyType && (
                        <div>
                          <span className="text-charcoal-muted">Type :</span>{" "}
                          <span className="font-medium text-obsidian">{item.propertyType}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-charcoal-muted">Déclarant :</span>{" "}
                        <span className="font-medium text-obsidian">{item.declaredBy?.email ?? "—"}</span>
                      </div>
                      <div>
                        <span className="text-charcoal-muted">Pipeline :</span>{" "}
                        <span className="font-medium text-obsidian">{item.pipelineStage}</span>
                      </div>
                    </div>
                    {item.internalNotes && (
                      <div className="bg-sand rounded-lg p-2.5">
                        <p className="text-xs text-charcoal-muted">
                          <span className="font-medium">Note :</span> {item.internalNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal d'action */}
      {selected && (
        <ActionModal property={selected} onClose={() => setSelected(null)} onDone={handleDone} />
      )}
    </div>
  );
}
