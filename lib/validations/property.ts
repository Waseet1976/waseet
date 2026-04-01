import { z } from "zod";

// ── Schéma complet de déclaration de bien ─────────────────────────────────────
export const declarePropertySchema = z.object({

  // ── Section 1 : Localisation ──────────────────────────────────────────────
  country:      z.string(),
  city:         z.string().trim().min(2, "La ville est requise"),
  neighborhood: z.string().trim().optional(),
  address:      z.string().trim().optional(),
  postalCode:   z.string().trim().optional(),
  latitude:     z.number().optional(),
  longitude:    z.number().optional(),

  // ── Section 2 : Caractéristiques ─────────────────────────────────────────
  propertyType: z.enum([
    "APARTMENT", "VILLA", "HOUSE", "LAND",
    "COMMERCIAL", "OFFICE", "WAREHOUSE", "OTHER",
  ]),
  surfaceSqm: z
    .number({ error: "Entrez la surface en m²" })
    .positive("La surface doit être positive"),
  estimatedPrice: z
    .number({ error: "Entrez le prix estimé" })
    .positive("Le prix doit être positif"),
  roomsCount:  z.number().int().min(0).optional(),
  description: z.string().trim().max(2000).optional(),

  // ── Section 3 : Propriétaire ─────────────────────────────────────────────
  ownerName:  z.string().trim().min(2, "Le nom du propriétaire est requis"),
  ownerPhone: z.string().trim().min(6, "Le téléphone est requis"),
  ownerEmail: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Email invalide"
    ),
  agencyId: z.string().optional(),

  // ── Section 4 : Fichiers (URLs après upload Supabase) ────────────────────
  photos:        z.array(z.string()).optional(),
  internalNotes: z.string().trim().max(2000).optional(),
});

export type DeclarePropertyFormData = z.infer<typeof declarePropertySchema>;

// ── Schéma legacy (conservé pour compatibilité) ───────────────────────────────
export const propertySchema = z.object({
  title:       z.string().min(5, "Le titre doit contenir au moins 5 caractères").max(200),
  description: z.string().optional(),
  type:        z.enum(["APARTMENT", "VILLA", "HOUSE", "LAND", "COMMERCIAL", "OFFICE", "WAREHOUSE", "OTHER"]),
  city:        z.string().min(2, "La ville est requise"),
  surface:     z.number().positive().optional(),
  price:       z.number().positive().optional(),
});

export type PropertyFormData = z.infer<typeof propertySchema>;
