/**
 * POST /api/geocoding
 * Convertit une adresse textuelle en coordonnées GPS via Google Geocoding API.
 * Body : { address?, city, country }
 * Retourne : { lat, lng, formattedAddress }
 */

import { NextRequest, NextResponse }       from "next/server";
import { z }                               from "zod";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import { geocodeAddress }                  from "@/lib/services/maps.service";

const bodySchema = z.object({
  address: z.string().max(200).optional(),
  city:    z.string().min(1).max(100),
  country: z.string(),
});

export async function POST(req: NextRequest) {
  // Auth requise (évite l'abus de quota Google)
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const result = bodySchema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Données invalides", field: issue?.path[0] },
      { status: 422 }
    );
  }

  const { address, city, country } = result.data;

  const coords = await geocodeAddress(address ?? "", city, country);
  if (!coords) {
    return NextResponse.json(
      { error: "Adresse introuvable — vérifiez les informations saisies" },
      { status: 404 }
    );
  }

  return NextResponse.json(coords);
}
