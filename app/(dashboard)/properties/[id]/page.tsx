"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Star, MapPin, Ruler, Building2,
  Phone, Mail, User, Calendar, Eye, EyeOff,
  AlertTriangle, Copy, Check,
} from "lucide-react";

import { useAuth }          from "@/lib/hooks/useAuth";
import { Badge }            from "@/components/ui/Badge";
import { PipelineVisual }   from "@/components/property/PipelineVisual";
import { Timeline }         from "@/components/property/Timeline";
import type { TimelineLog } from "@/components/property/Timeline";
import { PIPELINE_STAGES }  from "@/lib/config";
import {
  formatPrice, formatDate, formatDatetime, calculateCommission,
} from "@/lib/utils";
import { cn } from "@/lib/utils/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Commission {
  id:              string;
  estimatedAmount: number | null;
  validatedAmount: number | null;
  status:          string;
  paidAt:          string | null;
}

interface PropertyDetail {
  id:             string;
  reference:      string;
  country:        string | null;
  city:           string | null;
  neighborhood:   string | null;
  address:        string | null;
  postalCode:     string | null;
  latitude:       number | null;
  longitude:      number | null;
  propertyType:   string | null;
  surfaceSqm:     number | null;
  roomsCount:     number | null;
  description:    string | null;
  estimatedPrice: number | null;
  ownerName:      string | null;
  ownerPhone:     string;
  ownerEmail:     string | null;
  photos:         string[];
  pipelineStage:  string;
  adminStatus:    string;
  isPriority:     boolean;
  isDuplicate:    boolean;
  declaredAt:     string;
  mandateSignedAt:    string | null;
  compromiseSignedAt: string | null;
  deedSignedAt:       string | null;
  internalNotes:  string | null;
  declaredBy: {
    id: string; firstName: string; lastName: string; email: string; role: string;
  };
  assignedAgent: {
    user: { firstName: string; lastName: string };
  } | null;
  pipelineLogs: TimelineLog[];
  commissions:  Commission[];
}

const TYPE_LABEL: Record<string, string> = {
  APARTMENT: "Appartement", HOUSE: "Maison", VILLA: "Villa",
  LAND: "Terrain", COMMERCIAL: "Commercial", OFFICE: "Bureau",
  WAREHOUSE: "Entrepôt", OTHER: "Autre",
};

function stageBadge(stage: string): "success" | "gold" | "warning" | "muted" {
  const prog = PIPELINE_STAGES[stage as keyof typeof PIPELINE_STAGES]?.progress ?? 0;
  if (prog === 100) return "success";
  if (prog >= 57)   return "gold";
  if (prog >= 28)   return "warning";
  return "muted";
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function PropertyDetailPage() {
  const params  = useParams<{ id: string }>();
  const router  = useRouter();
  const { user, isLoading } = useAuth();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [copiedRef, setCopiedRef]     = useState(false);
  const [gallery, setGallery]         = useState(0); // index photo active

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("waseet_token");
    fetch(`/api/properties/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setProperty(d.property);
      })
      .catch(() => setError("Erreur réseau"))
      .finally(() => setLoading(false));
  }, [user, params.id]);

  const copyRef = async () => {
    if (!property) return;
    await navigator.clipboard.writeText(property.reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const canSeeContact = user?.role === "ADMIN" || user?.role === "AGENCY";

  // ── States ────────────────────────────────────────────────────────────────
  if (isLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-48 bg-charcoal-light rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div className="h-32 bg-sand-dark rounded-2xl" />
            <div className="h-48 bg-sand-dark rounded-2xl" />
          </div>
          <div className="h-64 bg-sand-dark rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-10 h-10 text-danger mb-3" />
        <p className="text-base font-semibold text-obsidian mb-1">
          {error ?? "Bien introuvable"}
        </p>
        <Link href="/properties" className="text-sm text-[#635BFF] hover:text-[#4C45E0] mt-4">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const stageConfig  = PIPELINE_STAGES[property.pipelineStage as keyof typeof PIPELINE_STAGES];
  const typeLabel    = TYPE_LABEL[property.propertyType ?? ""] ?? property.propertyType;
  const commission   = property.commissions[0] ?? null;

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-6">

      {/* ── Retour ───────────────────────────────────────────────────────────── */}
      <Link
        href="/properties"
        className="inline-flex items-center gap-2 text-sm text-charcoal-muted hover:text-[#635BFF] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux biens
      </Link>

      {/* ════ HERO ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-charcoal rounded-2xl px-6 py-7 text-white overflow-hidden relative">
        {/* Fond décoratif */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(circle at 70% 50%, #C9973A 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              {/* Référence */}
              <button
                onClick={copyRef}
                className="flex items-center gap-2 mb-2 group"
                title="Copier la référence"
              >
                <span className="text-[#635BFF] font-mono font-bold text-lg">
                  {property.reference}
                </span>
                {copiedRef
                  ? <Check className="w-3.5 h-3.5 text-success" />
                  : <Copy className="w-3.5 h-3.5 text-white/30 group-hover:text-[#635BFF] transition-colors" />
                }
              </button>

              {/* Type + Ville */}
              <h1 className="text-2xl font-bold text-white">
                {typeLabel} à {property.city}
                {property.neighborhood && (
                  <span className="text-white/50 font-normal text-xl ml-2">
                    · {property.neighborhood}
                  </span>
                )}
              </h1>

              {property.address && (
                <p className="text-white/50 text-sm mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {property.address}
                </p>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {property.isPriority && (
                <Badge variant="gold" className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Prioritaire
                </Badge>
              )}
              <Badge variant={stageBadge(property.pipelineStage)}>
                {stageConfig?.label ?? property.pipelineStage}
              </Badge>
              {property.adminStatus === "PENDING" && (
                <Badge variant="warning">En attente validation</Badge>
              )}
            </div>
          </div>

          {/* Prix + horodatage + progression */}
          <div className="mt-6 flex items-end justify-between flex-wrap gap-4">
            <div>
              {property.estimatedPrice && (
                <p className="text-3xl font-bold text-white">
                  {formatPrice(
                    property.estimatedPrice,
                    "BE"
                  )}
                </p>
              )}
              {property.surfaceSqm && (
                <p className="text-white/50 text-sm mt-0.5">
                  {property.surfaceSqm} m²
                  {property.estimatedPrice && property.surfaceSqm && (
                    <span className="ml-2">
                      ·{" "}
                      {formatPrice(
                        Math.round(property.estimatedPrice / property.surfaceSqm),
                        "BE"
                      )}
                      /m²
                    </span>
                  )}
                </p>
              )}
              <p className="text-white/35 text-xs mt-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Déclaré le {formatDatetime(property.declaredAt)}
              </p>
            </div>

            {/* Barre de progression */}
            <div className="flex flex-col items-end gap-1.5">
              <p className="text-white/50 text-xs">
                Pipeline : {stageConfig?.progress ?? 0}%
              </p>
              <div className="w-36 h-2 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stageConfig?.progress ?? 0}%`,
                    background: stageConfig?.color ?? "#C9973A",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════ CORPS ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── Colonne gauche (2/3) ──────────────────────────────────────────── */}
        <div className="md:col-span-2 space-y-6">

          {/* ── Informations du bien ──────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-sand-dark/40 shadow-card p-5">
            <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-4">
              Informations
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <InfoRow icon={<Building2 />} label="Type"    value={typeLabel} />
              <InfoRow icon={<MapPin />}   label="Pays"    value={property.country === "BE" ? "Belgique 🇧🇪" : "Maroc 🇲🇦"} />
              {property.surfaceSqm && (
                <InfoRow icon={<Ruler />} label="Surface" value={`${property.surfaceSqm} m²`} />
              )}
              {property.roomsCount != null && (
                <InfoRow label="Pièces" value={`${property.roomsCount} pièce(s)`} />
              )}
              {property.postalCode && (
                <InfoRow label="Code postal" value={property.postalCode} />
              )}
              {property.declaredBy && (
                <InfoRow
                  icon={<User />}
                  label="Déclaré par"
                  value={`${property.declaredBy.firstName} ${property.declaredBy.lastName}`}
                />
              )}
              {property.assignedAgent && (
                <InfoRow
                  label="Agent assigné"
                  value={`${property.assignedAgent.user.firstName} ${property.assignedAgent.user.lastName}`}
                />
              )}
            </div>

            {property.description && (
              <div className="mt-4 pt-4 border-t border-sand-dark">
                <p className="text-xs text-charcoal-muted mb-1">Description</p>
                <p className="text-sm text-charcoal leading-relaxed">{property.description}</p>
              </div>
            )}
          </section>

          {/* ── Propriétaire ──────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-sand-dark/40 shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider">
                Propriétaire
              </h2>
              {!canSeeContact && (
                <button
                  onClick={() => setShowContact((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-[#635BFF] hover:text-[#4C45E0] transition-colors"
                >
                  {showContact ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showContact ? "Masquer" : "Afficher"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {property.ownerName && (
                <InfoRow icon={<User />}  label="Nom"       value={property.ownerName} />
              )}
              <InfoRow
                icon={<Phone />}
                label="Téléphone"
                value={canSeeContact || showContact ? property.ownerPhone : "••••••••••"}
              />
              {property.ownerEmail && (
                <InfoRow
                  icon={<Mail />}
                  label="Email"
                  value={canSeeContact || showContact ? property.ownerEmail : "••••@••••"}
                />
              )}
            </div>
          </section>

          {/* ── Galerie photos ────────────────────────────────────────────── */}
          {property.photos.length > 0 && (
            <section className="bg-white rounded-2xl border border-sand-dark/40 shadow-card p-5">
              <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-4">
                Photos ({property.photos.length})
              </h2>
              {/* Grande photo */}
              <div className="aspect-video rounded-xl overflow-hidden bg-sand-dark mb-3">
                <img
                  src={property.photos[gallery]}
                  alt={`Photo ${gallery + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Thumbnails */}
              {property.photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {property.photos.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setGallery(i)}
                      className={cn(
                        "flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all",
                        gallery === i ? "border-[#635BFF]" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Pipeline visuel ───────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-sand-dark/40 shadow-card p-5">
            <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-6">
              Avancement du pipeline
            </h2>
            <PipelineVisual currentStage={property.pipelineStage} />
          </section>

          {/* ── Timeline ─────────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-sand-dark/40 shadow-card p-5">
            <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-5">
              Historique ({property.pipelineLogs.length})
            </h2>
            <Timeline logs={property.pipelineLogs} />
          </section>

          {/* ── Commission ───────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-sand-dark/40 shadow-card p-5">
            <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-4">
              Commission apporteur
            </h2>

            {commission ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-charcoal-muted">Montant estimé</p>
                  <p className="text-lg font-bold text-[#635BFF]">
                    {formatPrice(commission.estimatedAmount, "BE")}
                  </p>
                </div>
                {commission.validatedAmount && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-charcoal-muted">Montant validé</p>
                    <p className="text-lg font-bold text-success">
                      {formatPrice(commission.validatedAmount, "BE")}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-sand-dark">
                  <p className="text-sm text-charcoal-muted">Statut</p>
                  <Badge
                    variant={
                      commission.status === "PAID"      ? "success" :
                      commission.status === "VALIDATED" ? "gold"    : "warning"
                    }
                  >
                    {commission.status === "PAID"      ? "Payée"   :
                     commission.status === "VALIDATED" ? "Validée" : "Estimée"}
                  </Badge>
                </div>
                {commission.paidAt && (
                  <p className="text-xs text-charcoal-muted">
                    Payée le {formatDate(commission.paidAt)}
                  </p>
                )}
              </div>
            ) : property.estimatedPrice ? (
              <div className="space-y-2">
                <p className="text-xs text-charcoal-muted mb-3">
                  Calcul estimatif (commission créée à l'acte signé)
                </p>
                {(() => {
                  const calc = calculateCommission(property.estimatedPrice!);
                  return (
                    <div className="bg-sand rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-charcoal-muted">Prix × 2.5% (agence)</span>
                        <span className="font-medium">{formatPrice(calc.agencyCommission, "BE")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-muted">× 40% (part apporteur)</span>
                        <span className="font-bold text-[#635BFF]">{formatPrice(calc.apporteurShare, "BE")}</span>
                      </div>
                      <div className="pt-2 border-t border-sand-dark flex justify-between">
                        <span className="text-charcoal-muted text-xs">Estimation non garantie</span>
                        <Badge variant="warning">En attente</Badge>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-sm text-charcoal-muted italic">
                Prix estimé non renseigné — calcul impossible.
              </p>
            )}
          </section>
        </div>

        {/* ── Colonne droite (1/3) ──────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* ── Mini carte ────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-sand-dark/40 shadow-card p-4">
            <h3 className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-3">
              Localisation
            </h3>

            {property.latitude && property.longitude ? (
              <>
                <div className="rounded-xl overflow-hidden h-48 mb-3">
                  <iframe
                    src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                    className="w-full h-full border-0"
                    loading="lazy"
                    title="Carte du bien"
                  />
                </div>
                <div className="space-y-1.5 text-xs text-charcoal-muted">
                  <div className="flex justify-between">
                    <span>Latitude</span>
                    <span className="font-mono text-charcoal">{property.latitude.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Longitude</span>
                    <span className="font-mono text-charcoal">{property.longitude.toFixed(6)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-48 rounded-xl bg-sand flex items-center justify-center flex-col gap-2">
                <MapPin className="w-6 h-6 text-charcoal-muted" />
                <p className="text-xs text-charcoal-muted">GPS non renseigné</p>
              </div>
            )}
          </div>

          {/* ── Dates pipeline ────────────────────────────────────────────── */}
          {(property.mandateSignedAt || property.compromiseSignedAt || property.deedSignedAt) && (
            <div className="bg-white rounded-2xl border border-sand-dark/40 shadow-card p-4">
              <h3 className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-3">
                Dates clés
              </h3>
              <div className="space-y-2 text-xs">
                {property.mandateSignedAt && (
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Mandat signé</span>
                    <span className="font-medium">{formatDate(property.mandateSignedAt)}</span>
                  </div>
                )}
                {property.compromiseSignedAt && (
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Compromis signé</span>
                    <span className="font-medium">{formatDate(property.compromiseSignedAt)}</span>
                  </div>
                )}
                {property.deedSignedAt && (
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Acte signé</span>
                    <span className="font-medium text-success">{formatDate(property.deedSignedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Notes internes ────────────────────────────────────────────── */}
          {property.internalNotes && (canSeeContact || showContact) && (
            <div className="bg-white rounded-2xl border border-sand-dark/40 shadow-card p-4">
              <h3 className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-2">
                Notes internes
              </h3>
              <p className="text-xs text-charcoal italic leading-relaxed">
                {property.internalNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helper ligne d'info ───────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon?:  React.ReactNode;
  label:  string;
  value:  string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] text-charcoal-muted uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-obsidian flex items-center gap-1.5">
        {icon && (
          <span className="text-charcoal-muted [&>svg]:w-3.5 [&>svg]:h-3.5">
            {icon}
          </span>
        )}
        {value}
      </p>
    </div>
  );
}
