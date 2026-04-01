import { z } from "zod";

// ── Helpers ───────────────────────────────────────────────────
// Zod v4 : z.string().email() est deprecated → utiliser z.email()
// Pour garder .trim() et .toLowerCase() on utilise .pipe()
const emailField = (msg = "Email invalide") =>
  z.string().trim().toLowerCase().pipe(z.email(msg));

const passwordField = z
  .string()
  .min(8, "Minimum 8 caractères")
  .regex(/[A-Z]/, "Au moins une majuscule")
  .regex(/[0-9]/, "Au moins un chiffre");

// ── Register ──────────────────────────────────────────────────
export const registerSchema = z.object({
  email:     emailField(),
  password:  passwordField,
  firstName: z.string().trim().min(2, "Minimum 2 caractères").max(50),
  lastName:  z.string().trim().min(2, "Minimum 2 caractères").max(50),
  phone:     z.string().trim().min(8, "Numéro invalide").max(20).optional(),
  // Pas de .default() — la valeur par défaut est gérée dans le formulaire via defaultValues
  country:   z.string(),
  referralCode: z
    .string()
    .regex(/^WST-[A-Z0-9]{6}$/, "Code parrainage invalide")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

// ── Login ─────────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    emailField(),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// ── Inferred types ────────────────────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;
