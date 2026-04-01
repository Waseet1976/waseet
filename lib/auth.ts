import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;
const JWT_SECRET  = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRY  = (process.env.JWT_EXPIRY ?? "7d") as jwt.SignOptions["expiresIn"];

// ── Types ─────────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  role:   string;
}

// ── Password ──────────────────────────────────────────────────

/** Hashe un mot de passe avec bcrypt (12 rounds). */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** Vérifie un mot de passe contre son hash. */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT ───────────────────────────────────────────────────────

/** Génère un token JWT signé. */
export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role } satisfies JwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

/**
 * Vérifie et décode un token JWT.
 * Retourne null si invalide ou expiré.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (
      typeof payload === "object" &&
      "userId" in payload &&
      "role" in payload
    ) {
      return payload as JwtPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extrait le token Bearer depuis un header Authorization.
 * @example extractBearerToken("Bearer eyJ...") → "eyJ..."
 */
export function extractBearerToken(
  authHeader: string | null | undefined
): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}
