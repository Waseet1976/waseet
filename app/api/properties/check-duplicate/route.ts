import { NextRequest, NextResponse } from "next/server";

import { prisma }                        from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import { buildDuplicateKey }             from "@/lib/utils";

// ── GET /api/properties/check-duplicate ──────────────────────────────────────
// Vérifie combien de biens similaires existent déjà.
// Query params : country, city, surface, price
// Réponse : { count: number, isPriority: boolean }
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Auth
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") ?? "";
  const city    = searchParams.get("city")    ?? "";
  const surface = parseFloat(searchParams.get("surface") ?? "");
  const price   = parseFloat(searchParams.get("price")   ?? "");

  if (!country || !city || isNaN(surface) || isNaN(price)) {
    return NextResponse.json({ count: 0, isPriority: true });
  }

  const duplicateKey = buildDuplicateKey(country, city, surface, price);
  const count = await prisma.property.count({ where: { duplicateKey } });

  return NextResponse.json({ count, isPriority: count === 0 });
}
