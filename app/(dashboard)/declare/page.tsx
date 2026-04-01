"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller }               from "react-hook-form";
import { zodResolver }                       from "@hookform/resolvers/zod";
import { useRouter }                         from "next/navigation";
import {
  Clock, AlertTriangle, CheckCircle2, MapPin, Crosshair,
  Building2, Home, Briefcase, Archive, HelpCircle,
  Ruler, DollarSign, Phone, Mail, User,
  ChevronDown, Star,
} from "lucide-react";

import { declarePropertySchema, type DeclarePropertyFormData } from "@/lib/validations/property";
import { useAuth }      from "@/lib/hooks/useAuth";
import { PROPERTY_TYPES, MAX_PHOTOS_PER_PROPERTY } from "@/lib/config";
import { formatPrice }  from "@/lib/utils";
import { Button }       from "@/components/ui/Button";
import { Input }        from "@/components/ui/Input";
import { FileUpload }   from "@/components/forms/FileUpload";
import { cn }           from "@/lib/utils/cn";

// ── Données statiques ─────────────────────────────────────────────────────────

const CITIES: string[] = [
  "Bruxelles", "Anvers", "Gand", "Charleroi", "Liège", "Bruges",
  "Namur", "Mons", "Louvain", "Hasselt", "Kortrijk", "Genk",
  "Ostende", "Tournai", "La Louvière", "Malines", "Seraing",
  "Mouscron", "Sint-Niklaas", "Aalst",
];

const TYPE_ICONS: Record<string, React.ElementType> = {
  APARTMENT:  Building2,
  HOUSE:      Home,
  VILLA:      Home,
  LAND:       MapPin,
  COMMERCIAL: Building2,
  OFFICE:     Briefcase,
  WAREHOUSE:  Archive,
  OTHER:      HelpCircle,
};

// ── Toast interne ─────────────────────────────────────────────────────────────

interface Toast { message: string; type: "success" | "error"; ts: string }

// ── Composant principal ───────────────────────────────────────────────────────

export default function DeclarePage() {
  const router           = useRouter();
  const { user, isLoading } = useAuth();

  // Horodatage temps réel
  const [now, setNow]       = useState(new Date());
  const [toast, setToast]   = useState<Toast | null>(null);
  const [photoUrls, setPhotoUrls]   = useState<string[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fermeture automatique du toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  // ── Formulaire ──────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DeclarePropertyFormData>({
    resolver: zodResolver(declarePropertySchema),
    defaultValues: {
      country:      "BE",
      propertyType: "APARTMENT",
      photos:       [],
    },
    mode: "onBlur",
  });

  const estimatedPrice = watch("estimatedPrice");

  // ── GPS ─────────────────────────────────────────────────────────────────────
  const detectPosition = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude",  pos.coords.latitude,  { shouldValidate: true });
        setValue("longitude", pos.coords.longitude, { shouldValidate: true });
        setGpsLoading(false);
      },
      () => setGpsLoading(false)
    );
  }, [setValue]);

  // ── Soumission ──────────────────────────────────────────────────────────────
  const onSubmit = async (data: DeclarePropertyFormData) => {
    const token = localStorage.getItem("waseet_token");

    try {
      const res = await fetch("/api/properties", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          photos: photoUrls,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setToast({
          type:    "error",
          message: json.error ?? "Une erreur est survenue.",
          ts:      now.toLocaleTimeString("fr-BE"),
        });
        return;
      }

      const ts = new Date(json.declaredAt ?? now).toLocaleString("fr-BE", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });

      setToast({
        type:    "success",
        message: `Bien déclaré avec succès · Réf. ${json.reference} · ${ts}${json.isPriority ? " · Vous êtes prioritaire !" : ""}`,
        ts,
      });

      // Redirection après 2 secondes
      setTimeout(() => router.push("/properties"), 2000);
    } catch {
      setToast({
        type:    "error",
        message: "Erreur réseau. Vérifiez votre connexion.",
        ts:      now.toLocaleTimeString("fr-BE"),
      });
    }
  };

  // ── Rendu ────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = (error?: { message?: string }) =>
    cn(
      "w-full h-11 bg-white text-obsidian text-sm border rounded-xl px-4",
      "placeholder:text-charcoal-muted transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-[#635BFF]/40 focus:border-[#635BFF]",
      "disabled:opacity-50 disabled:bg-sand",
      error
        ? "border-danger focus:ring-danger/30 focus:border-danger"
        : "border-sand-dark hover:border-charcoal-muted/50"
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* ── En-tête ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-obsidian">Déclarer un bien</h1>
          <p className="text-charcoal-muted text-sm mt-1">
            Renseignez toutes les informations du bien à déclarer.
          </p>
        </div>

        {/* Badge horodatage temps réel */}
        <div className="flex items-center gap-2 bg-white border border-sand-dark rounded-xl px-3.5 py-2.5 shadow-sm flex-shrink-0">
          <Clock className="w-4 h-4 text-[#635BFF] flex-shrink-0" />
          <div>
            <p className="text-[10px] text-charcoal-muted leading-none mb-0.5">Heure de déclaration</p>
            <p className="text-sm font-mono font-semibold text-obsidian tabular-nums">
              {now.toLocaleTimeString("fr-BE")}
            </p>
            <p className="text-[10px] text-charcoal-muted leading-none">
              {now.toLocaleDateString("fr-BE", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Règle priorité ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-[#635BFF]/8 border border-[#635BFF]/30 rounded-2xl px-4 py-3.5">
        <Star className="w-5 h-5 text-[#635BFF] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-obsidian">Règle de priorité</p>
          <p className="text-xs text-charcoal-muted mt-0.5 leading-relaxed">
            Le <strong>premier apporteur</strong> à déclarer un bien (même ville + quartier + propriétaire)
            obtient la <strong>priorité</strong> sur l'opportunité et touche la commission en premier.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

        {/* ════ SECTION 1 — Localisation ═════════════════════════════════════════ */}
        <SectionCard number={1} title="Localisation">

          {/* Ville + Quartier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Ville *
              </label>
              <div className="relative">
                <select
                  className={inputClass(errors.city)}
                  {...register("city")}
                >
                  <option value="">— Sélectionner —</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
              </div>
              {errors.city && (
                <p className="mt-1.5 text-xs text-danger">{errors.city.message}</p>
              )}
            </div>

            <Input
              label="Quartier / Commune"
              type="text"
              placeholder="Ixelles, Uccle, Molenbeek…"
              hint="Optionnel"
              error={errors.neighborhood?.message}
              {...register("neighborhood")}
            />
          </div>

          {/* Adresse + Code postal */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input
                label="Adresse"
                type="text"
                placeholder="Rue, numéro…"
                hint="Optionnel"
                error={errors.address?.message}
                {...register("address")}
              />
            </div>
            <Input
              label="Code postal"
              type="text"
              placeholder="1000"
              hint="Optionnel"
              error={errors.postalCode?.message}
              {...register("postalCode")}
            />
          </div>

          {/* Latitude / Longitude */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-charcoal">
                Coordonnées GPS
                <span className="text-charcoal-muted font-normal ml-1">(optionnel)</span>
              </label>
              <button
                type="button"
                onClick={detectPosition}
                disabled={gpsLoading}
                className="flex items-center gap-1.5 text-xs text-[#635BFF] hover:text-[#4C45E0] font-medium transition-colors disabled:opacity-50"
              >
                {gpsLoading
                  ? <span className="w-3.5 h-3.5 border border-[#635BFF] border-t-transparent rounded-full animate-spin" />
                  : <Crosshair className="w-3.5 h-3.5" />
                }
                Détecter ma position
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="33.5731"
                step="0.0001"
                error={errors.latitude?.message}
                {...register("latitude", { valueAsNumber: true })}
              />
              <Input
                type="number"
                placeholder="-7.5898"
                step="0.0001"
                error={errors.longitude?.message}
                {...register("longitude", { valueAsNumber: true })}
              />
            </div>
          </div>
        </SectionCard>

        {/* ════ SECTION 2 — Caractéristiques ═════════════════════════════════════ */}
        <SectionCard number={2} title="Caractéristiques">

          {/* Type de bien */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Type de bien *</label>
            <Controller
              control={control}
              name="propertyType"
              render={({ field }) => (
                <div className="grid grid-cols-4 gap-2">
                  {PROPERTY_TYPES.map((t) => {
                    const Icon   = TYPE_ICONS[t.value] ?? Building2;
                    const active = field.value === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => field.onChange(t.value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                          active
                            ? "border-[#635BFF] bg-[#635BFF]/5 text-[#635BFF]"
                            : "border-sand-dark hover:border-charcoal-muted/30 text-charcoal-muted hover:text-charcoal"
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-[11px] font-medium leading-tight text-center">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.propertyType && (
              <p className="mt-1.5 text-xs text-danger">{errors.propertyType.message}</p>
            )}
          </div>

          {/* Surface + Pièces */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Surface (m²) *"
              type="number"
              icon={<Ruler />}
              placeholder="120"
              min="1"
              step="0.5"
              error={errors.surfaceSqm?.message}
              {...register("surfaceSqm", { valueAsNumber: true })}
            />
            <Input
              label="Nombre de pièces"
              type="number"
              placeholder="4"
              min="0"
              step="1"
              hint="Optionnel"
              error={errors.roomsCount?.message}
              {...register("roomsCount", { valueAsNumber: true })}
            />
          </div>

          {/* Prix estimé + devise */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Prix estimé *
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
                <input
                  type="number"
                  placeholder="250 000"
                  min="1"
                  step="1000"
                  className={cn(inputClass(errors.estimatedPrice), "pl-10")}
                  {...register("estimatedPrice", { valueAsNumber: true })}
                />
              </div>
              {/* Badge devise */}
              <div className="flex items-center justify-center h-11 px-4 bg-sand border border-sand-dark rounded-xl text-sm font-semibold text-charcoal min-w-[60px]">
                €
              </div>
            </div>
            {errors.estimatedPrice && (
              <p className="mt-1.5 text-xs text-danger">{errors.estimatedPrice.message}</p>
            )}
            {/* Preview prix formaté */}
            {estimatedPrice > 0 && (
              <p className="mt-1 text-xs text-[#635BFF] font-medium">
                = {formatPrice(estimatedPrice, "BE")}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Description
              <span className="text-charcoal-muted font-normal ml-1">(optionnel)</span>
            </label>
            <textarea
              rows={4}
              placeholder={`Appartement lumineux au 3ème étage, vue dégagée, cuisine équipée…`}
              className={cn(
                "w-full bg-white text-obsidian text-sm border rounded-xl px-4 py-3",
                "placeholder:text-charcoal-muted resize-none transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[#635BFF]/40 focus:border-[#635BFF]",
                errors.description
                  ? "border-danger"
                  : "border-sand-dark hover:border-charcoal-muted/50"
              )}
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-danger">{errors.description.message}</p>
            )}
          </div>
        </SectionCard>

        {/* ════ SECTION 3 — Propriétaire ══════════════════════════════════════════ */}
        <SectionCard number={3} title="Propriétaire">
          <div className="p-3 bg-warning-bg border border-warning/20 rounded-xl text-xs text-charcoal-muted flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
            Le téléphone du propriétaire est utilisé pour détecter les doublons.
            Renseignez le numéro exact pour garantir votre priorité.
          </div>

          {/* Nom + Téléphone */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nom complet *"
              type="text"
              icon={<User />}
              placeholder="Jean Dupont"
              error={errors.ownerName?.message}
              {...register("ownerName")}
            />

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Téléphone *
              </label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center h-11 px-3 bg-sand border border-sand-dark rounded-xl text-sm font-semibold text-charcoal flex-shrink-0">
                  +32
                </div>
                <div className="flex-1">
                  <Input
                    type="tel"
                    icon={<Phone />}
                    placeholder="471 00 00 00"
                    error={errors.ownerPhone?.message}
                    {...register("ownerPhone")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Email + Agence */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              icon={<Mail />}
              placeholder="proprietaire@exemple.com"
              hint="Optionnel"
              error={errors.ownerEmail?.message}
              {...register("ownerEmail")}
            />

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Agence partenaire
                <span className="text-charcoal-muted font-normal ml-1">(optionnel)</span>
              </label>
              <div className="relative">
                <select
                  className={inputClass(undefined)}
                  {...register("agencyId")}
                >
                  <option value="">— Aucune agence assignée —</option>
                  {/* Rempli dynamiquement via l'API /api/agencies */}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ════ SECTION 4 — Fichiers ══════════════════════════════════════════════ */}
        <SectionCard number={4} title="Fichiers">

          {/* Photos */}
          <FileUpload
            label={`Photos du bien (max ${MAX_PHOTOS_PER_PROPERTY})`}
            accept="image/jpeg,image/png,image/webp"
            multiple
            maxFiles={MAX_PHOTOS_PER_PROPERTY}
            maxSizeMB={10}
            bucket="properties"
            folder="photos"
            onUploadComplete={setPhotoUrls}
          />

          {/* Documents */}
          <FileUpload
            label="Documents (compromis, titre foncier…)"
            accept=".pdf,.doc,.docx"
            multiple
            maxFiles={5}
            maxSizeMB={10}
            bucket="properties"
            folder="documents"
            onUploadComplete={() => {}}
          />

          {/* Notes internes */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Notes internes
              <span className="text-charcoal-muted font-normal ml-1">(optionnel)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Informations confidentielles pour l'équipe…"
              className={cn(
                "w-full bg-white text-obsidian text-sm border rounded-xl px-4 py-3",
                "placeholder:text-charcoal-muted resize-none transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[#635BFF]/40 focus:border-[#635BFF]",
                "border-sand-dark hover:border-charcoal-muted/50"
              )}
              {...register("internalNotes")}
            />
          </div>
        </SectionCard>

        {/* ── Submit ──────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-charcoal-muted">
            * Champs obligatoires
          </p>
          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
            leftIcon={<CheckCircle2 />}
          >
            Déclarer ce bien
          </Button>
        </div>
      </form>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 max-w-sm",
            "flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl",
            "animate-slide-up",
            toast.type === "success"
              ? "bg-obsidian text-white border border-white/10"
              : "bg-danger-bg text-danger border border-danger/25"
          )}
        >
          {toast.type === "success"
            ? <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            : <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
          }
          <div>
            <p className="text-sm font-medium">{toast.message}</p>
            {toast.type === "success" && (
              <p className="text-xs text-white/50 mt-0.5">
                Redirection en cours…
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Composant section ─────────────────────────────────────────────────────────

function SectionCard({
  number,
  title,
  children,
}: {
  number:   number;
  title:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-sand-dark/40 shadow-card overflow-hidden">
      {/* En-tête section */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-sand-dark/40 bg-sand/30">
        <div className="w-7 h-7 rounded-full bg-[#635BFF] flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-white">{number}</span>
        </div>
        <h2 className="text-base font-semibold text-obsidian">{title}</h2>
      </div>

      {/* Corps */}
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}
