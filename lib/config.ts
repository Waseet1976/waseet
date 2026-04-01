import type { PipelineStage, Role, CommissionStatus } from "@prisma/client";

// ============================================================
// PIPELINE
// ============================================================

export const PIPELINE_STAGES: Record<
  PipelineStage,
  { label: string; progress: number; color: string }
> = {
  DECLARED: {
    label: "Déclaré",
    progress: 0,
    color: "#6B7280",
  },
  VALIDATED: {
    label: "Validé",
    progress: 14,
    color: "#3B82F6",
  },
  IN_REVIEW: {
    label: "En révision",
    progress: 28,
    color: "#F59E0B",
  },
  MANDATE_SIGNED: {
    label: "Mandat signé",
    progress: 42,
    color: "#8B5CF6",
  },
  COMPROMISE_SIGNED: {
    label: "Compromis signé",
    progress: 57,
    color: "#EC4899",
  },
  DEED_SIGNED: {
    label: "Acte signé",
    progress: 71,
    color: "#C9973A",
  },
  COMMISSION_VALIDATED: {
    label: "Commission validée",
    progress: 85,
    color: "#3A8A5A",
  },
  COMMISSION_PAID: {
    label: "Commission payée",
    progress: 100,
    color: "#15803D",
  },
};

// ============================================================
// RÔLES
// ============================================================

export const ROLES: Record<Role, { label: string; description: string }> = {
  ADMIN: {
    label: "Administrateur",
    description: "Accès complet à la plateforme",
  },
  AGENCY: {
    label: "Agence",
    description: "Gestion de l'agence et des agents",
  },
  AGENT: {
    label: "Agent",
    description: "Agent immobilier de l'agence",
  },
  DEAL_FINDER: {
    label: "Apporteur d'affaires",
    description: "Déclare des biens et reçoit des commissions",
  },
};

// ============================================================
// STATUTS DE COMMISSION
// ============================================================

export const COMMISSION_STATUSES: Record<
  CommissionStatus,
  { label: string; color: string }
> = {
  ESTIMATED: {
    label: "Estimée",
    color: "#F59E0B",
  },
  VALIDATED: {
    label: "Validée",
    color: "#3B82F6",
  },
  PAID: {
    label: "Payée",
    color: "#3A8A5A",
  },
};

// ============================================================
// PAYS SUPPORTÉS
// ============================================================

export const COUNTRIES = [
  { code: "BE", label: "Belgique", currency: "EUR", currencySymbol: "€", locale: "fr-BE" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export const COUNTRY_MAP = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c])
) as Record<CountryCode, (typeof COUNTRIES)[number]>;

// ============================================================
// TYPES DE BIENS
// ============================================================

export const PROPERTY_TYPES = [
  { value: "APARTMENT",  label: "Appartement" },
  { value: "HOUSE",      label: "Maison" },
  { value: "VILLA",      label: "Villa" },
  { value: "LAND",       label: "Terrain" },
  { value: "COMMERCIAL", label: "Local commercial" },
  { value: "OFFICE",     label: "Bureau" },
  { value: "WAREHOUSE",  label: "Entrepôt" },
  { value: "OTHER",      label: "Autre" },
] as const;

export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number]["value"];

// ============================================================
// PARRAINAGE
// ============================================================

export const BONUS_REFERRAL_AMOUNT = 250; // EUR

// ============================================================
// DIVERS
// ============================================================

export const APP_NAME = process.env.APP_NAME ?? "Waseet";
export const APP_URL  = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const DEFAULT_COMMISSION_RATE  = 2.5;  // %
export const DEFAULT_APPORTEUR_SHARE  = 40;   // % de la commission agence
export const MAX_PHOTOS_PER_PROPERTY  = 20;
export const MAX_FILE_SIZE_MB         = 10;
