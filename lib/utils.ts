import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { COUNTRY_MAP, type CountryCode } from "@/lib/config";

// ============================================================
// TAILWIND
// ============================================================

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================
// FORMAT PRIX
// ============================================================

/**
 * Formate un montant selon le pays.
 * @example formatPrice(1500, "BE") → "1 500 €"
 */
export function formatPrice(
  amount: number | null | undefined,
  countryCode: CountryCode = "BE"
): string {
  if (amount === null || amount === undefined) return "—";

  const country = COUNTRY_MAP[countryCode];

  return (
    new Intl.NumberFormat(country.locale, {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount) +
    " " +
    country.currencySymbol
  );
}

// ============================================================
// FORMAT DATES
// ============================================================

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy", { locale: fr });
}

export function formatDatetime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy · HH:mm", { locale: fr });
}

export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

// ============================================================
// GÉNÉRATION DE CODE PARRAINAGE
// ============================================================

/**
 * Génère un code parrainage unique de 8 caractères alphanum majuscule.
 * @example "WST-A3F8K2"
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans O/0/1/I ambigus
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WST-${code}`;
}

// ============================================================
// RÉFÉRENCE DE BIEN
// ============================================================

/**
 * Génère une référence de bien immobilier.
 * Format : {PAYS}-{ANNEE}-{6 car aléatoires}
 * @example generatePropertyReference("BE") → "BE-25-A3F8K2"
 */
export function generatePropertyReference(countryCode: CountryCode = "BE"): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${countryCode}-${year}-${suffix}`;
}

// ============================================================
// CALCUL DE COMMISSION
// ============================================================

interface CommissionResult {
  /** Montant total de commission de l'agence */
  agencyCommission: number;
  /** Part reversée à l'apporteur */
  apporteurShare: number;
  /** Part conservée par l'agence */
  agencyNet: number;
}

/**
 * Calcule la répartition de commission.
 * @param salePrice       Prix de vente du bien
 * @param commissionRate  Taux de commission de l'agence (%, défaut 2.5)
 * @param apporteurShare  Part de l'apporteur dans la commission (%, défaut 40)
 */
export function calculateCommission(
  salePrice: number,
  commissionRate = 2.5,
  apporteurShare = 40
): CommissionResult {
  const agencyCommission = (salePrice * commissionRate) / 100;
  const apporteurPart    = (agencyCommission * apporteurShare) / 100;
  const agencyNet        = agencyCommission - apporteurPart;

  return {
    agencyCommission: Math.round(agencyCommission),
    apporteurShare:   Math.round(apporteurPart),
    agencyNet:        Math.round(agencyNet),
  };
}

// ============================================================
// CLÉ DE DÉDOUBLONNAGE
// ============================================================

/**
 * Construit une clé normalisée pour détecter les biens en double.
 * Combine pays + ville + surface + prix estimé.
 * @example buildDuplicateKey("MA", "Casablanca", 120, 2500000) → "ma|casablanca|120|2500000"
 */
export function buildDuplicateKey(
  country: string | null | undefined,
  city: string | null | undefined,
  surfaceSqm: number | null | undefined,
  estimatedPrice: number | null | undefined
): string {
  const normalize = (s: string | null | undefined) =>
    (s ?? "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // enlève les accents
      .replace(/\s+/g, "-");

  return [
    normalize(country),
    normalize(city),
    surfaceSqm    != null ? Math.round(surfaceSqm).toString()    : "x",
    estimatedPrice != null ? Math.round(estimatedPrice).toString() : "x",
  ].join("|");
}

// ============================================================
// HELPERS DIVERS
// ============================================================

/** Initiales d'un nom complet (max 2 lettres) */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

/** Nom complet formaté */
export function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/** Slugifie une chaîne pour les URLs */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Tronque un texte avec ellipse */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}
