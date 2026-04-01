"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Copy, CheckCircle2, XCircle, MapPin, User, RefreshCw,
  ArrowRight, AlertTriangle, Eye,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

// ── Types ──────────────────────────────────────────────────────────────────────

interface DuplicateProperty {
  id:            string;
  reference:     string;
  city:          string | null;
  country:       string | null;
  neighborhood:  string | null;
  propertyType:  string | null;
  estimatedPrice: number | null;
  surfaceSqm:    number | null;
  adminStatus:   "PENDING" | "VALIDATED" | "REJECTED";
  isDuplicate:   boolean;
  duplicateKey:  string | null;
  createdAt:     string;
  internalNotes: string | null;
  declaredBy: {
    id:        string;
    firstName: string;
    lastName:  string;
    email:     string;
  } | null;
}

interface DuplicateGroup {
  key:        string;
  properties: DuplicateProperty[];
}

// ── Carte de propriété pour comparaison ───────────────────────────────────────

function PropCard({
  property,
  highlight = false,
}: {
  property:   DuplicateProperty;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "bg-white border rounded-xl p-4 space-y-2",
      highlight ? "border-[#635BFF] ring-1 ring-[#635BFF]/30" : "border-sand-dark"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-[#635BFF]">{property.reference}</span>
          <p className="text-xs text-charcoal-muted mt-0.5">
            {new Date(property.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          </p>
        </div>
        <Link
          href={`/properties/${property.id}`}
          target="_blank"
          className="p-1.5 rounded-lg text-charcoal-muted hover:bg-sand transition-colors"
          title="Voir le bien"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-1 text-xs">
        {property.city && (
          <div className="flex items-center gap-1.5 text-charcoal-muted">
            <MapPin className="w-3 h-3" />
            <span>{property.neighborhood ? `${property.neighborhood}, ` : ""}{property.city}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-charcoal-muted">
          <User className="w-3 h-3" />
          <span>{property.declaredBy?.firstName ?? "—"} {property.declaredBy?.lastName ?? ""}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        {property.propertyType && (
          <div className="bg-sand rounded-lg px-2 py-1.5 text-center">
            <p className="text-[10px] text-charcoal-muted">Type</p>
            <p className="text-xs font-semibold text-obsidian">{property.propertyType}</p>
          </div>
        )}
        {property.surfaceSqm && (
          <div className="bg-sand rounded-lg px-2 py-1.5 text-center">
            <p className="text-[10px] text-charcoal-muted">Surface</p>
            <p className="text-xs font-semibold text-obsidian">{property.surfaceSqm} m²</p>
          </div>
        )}
        {property.estimatedPrice && (
          <div className="bg-sand rounded-lg px-2 py-1.5 text-center col-span-2">
            <p className="text-[10px] text-charcoal-muted">Prix estimé</p>
            <p className="text-xs font-semibold text-obsidian">
              {property.estimatedPrice.toLocaleString("fr-FR")} {property.country === "BE" ? "€" : "DH"}
            </p>
          </div>
        )}
      </div>

      <div className="pt-1">
        <span className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-full",
          property.adminStatus === "PENDING"   ? "bg-warning-bg text-warning" :
          property.adminStatus === "VALIDATED" ? "bg-emerald-100 text-emerald-700" :
                                                  "bg-red-100 text-red-700"
        )}>
          {property.adminStatus === "PENDING"   ? "En attente" :
           property.adminStatus === "VALIDATED" ? "Validé" : "Refusé"}
        </span>
      </div>
    </div>
  );
}

// ── Modal d'action sur doublon ────────────────────────────────────────────────

function DuplicateActionModal({
  property,
  onClose,
  onDone,
}: {
  property: DuplicateProperty;
  onClose:  () => void;
  onDone:   () => void;
}) {
  const [action,  setAction]  = useState<"confirm_duplicate" | "deny_duplicate">("confirm_duplicate");
  const [note,    setNote]    = useState("");
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
          <h3 className="text-base font-semibold text-obsidian">Traiter le doublon</h3>
          <p className="text-sm text-charcoal-muted mt-0.5">{property.reference}</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => setAction("confirm_duplicate")}
            className={cn(
              "flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors",
              action === "confirm_duplicate"
                ? "bg-red-50 border-red-300"
                : "border-sand-dark hover:bg-sand"
            )}
          >
            <XCircle className={cn("w-4 h-4 mt-0.5 flex-shrink-0", action === "confirm_duplicate" ? "text-red-600" : "text-charcoal-muted")} />
            <div>
              <p className={cn("text-sm font-medium", action === "confirm_duplicate" ? "text-red-700" : "text-obsidian")}>
                Confirmer le doublon
              </p>
              <p className="text-xs text-charcoal-muted">Rejeter ce bien, c'est bien un doublon</p>
            </div>
          </button>
          <button
            onClick={() => setAction("deny_duplicate")}
            className={cn(
              "flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors",
              action === "deny_duplicate"
                ? "bg-emerald-50 border-emerald-300"
                : "border-sand-dark hover:bg-sand"
            )}
          >
            <CheckCircle2 className={cn("w-4 h-4 mt-0.5 flex-shrink-0", action === "deny_duplicate" ? "text-emerald-600" : "text-charcoal-muted")} />
            <div>
              <p className={cn("text-sm font-medium", action === "deny_duplicate" ? "text-emerald-700" : "text-obsidian")}>
                Ce n'est pas un doublon
              </p>
              <p className="text-xs text-charcoal-muted">Valider ce bien, retirer le flag doublon</p>
            </div>
          </button>
        </div>

        <div>
          <label className="text-xs font-medium text-obsidian mb-1 block">Note (optionnelle)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Commentaire…"
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
            disabled={loading}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors text-white disabled:opacity-50",
              action === "confirm_duplicate" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {loading ? "En cours…" : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function DuplicatesPage() {
  const [groups,   setGroups]   = useState<DuplicateGroup[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [selected, setSelected] = useState<DuplicateProperty | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("waseet_token") ?? "";
      const res   = await fetch("/api/properties?isDuplicate=true&limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      const props: DuplicateProperty[] = data.properties ?? [];

      // Grouper par duplicateKey
      const map = new Map<string, DuplicateProperty[]>();
      for (const p of props) {
        const key = p.duplicateKey ?? p.id;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(p);
      }

      const grouped: DuplicateGroup[] = Array.from(map.entries()).map(([k, ps]) => ({
        key:        k,
        properties: ps.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      }));

      setGroups(grouped);
    } catch {
      setError("Impossible de charger les doublons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = groups.filter((g) => g.properties.some((p) => p.adminStatus === "PENDING"));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-obsidian">Doublons</h1>
          <p className="text-sm text-charcoal-muted mt-0.5">
            {pending.length > 0
              ? `${pending.length} groupe${pending.length > 1 ? "s" : ""} à traiter`
              : "Aucun doublon en attente"}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-sand-dark rounded-lg hover:bg-sand transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
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

      {!loading && !error && groups.length === 0 && (
        <div className="text-center py-16 bg-white border border-sand-dark rounded-xl">
          <Copy className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-obsidian">Aucun doublon détecté</p>
          <p className="text-xs text-charcoal-muted mt-1">Tous les biens sont uniques</p>
        </div>
      )}

      {!loading && groups.map((group) => {
        const hasPending = group.properties.some((p) => p.adminStatus === "PENDING");
        // Premier déclaré = l'original, les suivants = potentiels doublons
        const [original, ...duplicates] = group.properties;

        return (
          <div
            key={group.key}
            className={cn(
              "bg-sand/50 border rounded-2xl overflow-hidden",
              hasPending ? "border-warning/40" : "border-sand-dark"
            )}
          >
            {/* Header groupe */}
            <div className={cn(
              "px-5 py-3 flex items-center gap-2 border-b",
              hasPending ? "bg-warning-bg border-warning/30" : "bg-white border-sand-dark"
            )}>
              {hasPending
                ? <AlertTriangle className="w-4 h-4 text-warning" />
                : <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              }
              <p className="text-sm font-semibold text-obsidian">
                Groupe doublon — {group.properties.length} biens
              </p>
              {!hasPending && (
                <span className="text-xs text-charcoal-muted ml-1">Traité</span>
              )}
            </div>

            {/* Comparaison côte à côte */}
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Original */}
                <div>
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                    Original (1er déclaré)
                  </p>
                  <PropCard property={original!} />
                </div>

                {/* Flèche séparateur */}
                {duplicates.length > 0 && (
                  <div className="hidden sm:flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-charcoal-muted/40" />
                  </div>
                )}

                {/* Doublons potentiels */}
                {duplicates.map((dup) => (
                  <div key={dup.id}>
                    <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider mb-2">
                      Doublon potentiel
                    </p>
                    <PropCard property={dup} highlight />
                    {dup.adminStatus === "PENDING" && (
                      <button
                        onClick={() => setSelected(dup)}
                        className="w-full mt-2 px-4 py-2 text-xs font-semibold bg-obsidian text-white rounded-lg hover:bg-charcoal-dark transition-colors"
                      >
                        Traiter ce doublon
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal */}
      {selected && (
        <DuplicateActionModal
          property={selected}
          onClose={() => setSelected(null)}
          onDone={() => { setSelected(null); load(); }}
        />
      )}
    </div>
  );
}
