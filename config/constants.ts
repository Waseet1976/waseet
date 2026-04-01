// ============================================
// Constantes Waseet
// ============================================

export const APP_NAME = "Waseet";
export const APP_DESCRIPTION = "Plateforme SaaS immobilière";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Plans
export const PLANS = {
  FREE: {
    name: "Gratuit",
    properties: 5,
    clients: 20,
    agents: 1,
  },
  BASIC: {
    name: "Basic",
    price: { monthly: 299, yearly: 2990 },
    properties: 50,
    clients: 200,
    agents: 3,
  },
  PRO: {
    name: "Pro",
    price: { monthly: 699, yearly: 6990 },
    properties: Infinity,
    clients: Infinity,
    agents: 10,
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: { monthly: 1499, yearly: 14990 },
    properties: Infinity,
    clients: Infinity,
    agents: Infinity,
  },
} as const;

// Belgique — Villes principales
export const BELGIAN_CITIES = [
  "Bruxelles", "Anvers", "Gand", "Charleroi", "Liège",
  "Bruges", "Namur", "Mons", "Louvain", "Hasselt",
  "Kortrijk", "Genk", "Ostende", "Tournai", "La Louvière",
  "Malines", "Seraing", "Mouscron", "Sint-Niklaas", "Aalst",
] as const;

export const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Appartement" },
  { value: "VILLA", label: "Villa" },
  { value: "HOUSE", label: "Maison" },
  { value: "LAND", label: "Terrain" },
  { value: "COMMERCIAL", label: "Local commercial" },
  { value: "OFFICE", label: "Bureau" },
  { value: "WAREHOUSE", label: "Entrepôt" },
  { value: "OTHER", label: "Autre" },
] as const;

export const PROPERTY_STATUSES = [
  { value: "AVAILABLE", label: "Disponible", color: "success" },
  { value: "RESERVED", label: "Réservé", color: "warning" },
  { value: "SOLD", label: "Vendu", color: "danger" },
  { value: "RENTED", label: "Loué", color: "gold" },
  { value: "WITHDRAWN", label: "Retiré", color: "charcoal" },
] as const;

export const CLIENT_TYPES = [
  { value: "BUYER", label: "Acheteur" },
  { value: "SELLER", label: "Vendeur" },
  { value: "TENANT", label: "Locataire" },
  { value: "LANDLORD", label: "Propriétaire" },
  { value: "INVESTOR", label: "Investisseur" },
] as const;

export const DEAL_STATUSES = [
  { value: "OPEN", label: "Ouvert", color: "gold" },
  { value: "IN_PROGRESS", label: "En cours", color: "warning" },
  { value: "NEGOTIATION", label: "Négociation", color: "warning" },
  { value: "UNDER_CONTRACT", label: "Sous contrat", color: "success" },
  { value: "CLOSED_WON", label: "Gagné", color: "success" },
  { value: "CLOSED_LOST", label: "Perdu", color: "danger" },
] as const;

// Currencies
export const CURRENCY = "EUR";
export const CURRENCY_SYMBOL = "€";

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_IMAGES_PER_PROPERTY = 20;
