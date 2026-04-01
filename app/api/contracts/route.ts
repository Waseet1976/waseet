/**
 * GET  /api/contracts — Liste des contrats (filtrée par rôle)
 * POST /api/contracts — Créer un contrat (ADMIN / AGENCY)
 */

import { NextRequest, NextResponse }       from "next/server";
import { z }                               from "zod";
import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";

const createSchema = z.object({
  propertyId: z.string().min(1),
  type:       z.enum(["MANDATE", "COMPROMISE", "DEED", "APPORTEUR_AGREEMENT"]),
  signers:    z.array(z.object({
    name:  z.string().min(1),
    email: z.string().email(),
    role:  z.string().min(1),
  })).min(1),
});

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const where =
    payload.role === "ADMIN"
      ? {}
      : {
          OR: [
            { userId:   payload.userId },
            { property: { declaredById: payload.userId } },
          ],
        };

  const contracts = await prisma.contract.findMany({
    where,
    include: {
      property: {
        select: {
          reference:      true,
          city:           true,
          neighborhood:   true,
          estimatedPrice: true,
          country:        true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName:  true,
          email:     true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ contracts });
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  if (payload.role !== "ADMIN" && payload.role !== "AGENCY")
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const result = createSchema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Données invalides", field: issue?.path[0] },
      { status: 422 }
    );
  }

  const { propertyId, type } = result.data;

  const property = await prisma.property.findUnique({
    where:   { id: propertyId },
    select:  { id: true },
  });
  if (!property) return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });

  const contract = await prisma.contract.create({
    data: {
      propertyId,
      userId: payload.userId,
      type,
      status: "DRAFT",
    },
  });

  return NextResponse.json({ contract }, { status: 201 });
}
