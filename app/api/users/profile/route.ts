/**
 * GET  /api/users/profile  — Profil complet avec contrats
 * PATCH /api/users/profile  — Modifier infos personnelles ou photo
 */

import { NextRequest, NextResponse } from "next/server";
import { z }                          from "zod";

import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";

// ── Schéma de validation ──────────────────────────────────────────────────────
const updateSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName:  z.string().trim().min(1).max(50).optional(),
  phone:     z.string().trim().max(20).optional(),
  country:   z.string().optional(),
  // Photo — stockée dans agent.photo si l'utilisateur a un profil agent
  photoUrl:  z.url().optional(),
});

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const [user, contracts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id:           true,
        email:        true,
        firstName:    true,
        lastName:     true,
        phone:        true,
        country:      true,
        role:         true,
        referralCode: true,
        isActive:     true,
        ghlContactId: true,
        agencyId:     true,
        createdAt:    true,
        agency: {
          select: {
            id:              true,
            name:            true,
            email:           true,
            phone:           true,
            commissionRate:  true,
            apporteurShare:  true,
            stripeCustomerId: true,
          },
        },
        agentProfile: {
          select: { photo: true, fonction: true },
        },
      },
    }),
    prisma.contract.findMany({
      where:   { userId: payload.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id:          true,
        type:        true,
        status:      true,
        signedAt:    true,
        documentUrl: true,
        createdAt:   true,
        property: {
          select: { reference: true, city: true },
        },
      },
    }),
  ]);

  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  return NextResponse.json({ user, contracts });
}

// ── PATCH ─────────────────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const result = updateSchema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Données invalides", field: issue?.path[0] },
      { status: 422 }
    );
  }

  const { photoUrl, ...userFields } = result.data;

  // Mise à jour en parallèle si nécessaire
  const updates: Promise<unknown>[] = [];

  // Infos de base sur l'utilisateur
  if (Object.keys(userFields).length > 0) {
    updates.push(
      prisma.user.update({
        where: { id: payload.userId },
        data:  userFields,
      })
    );
  }

  // Photo → agent.photo si le profil agent existe
  if (photoUrl) {
    const agent = await prisma.agent.findUnique({
      where: { userId: payload.userId },
    });
    if (agent) {
      updates.push(
        prisma.agent.update({
          where: { userId: payload.userId },
          data:  { photo: photoUrl },
        })
      );
    }
  }

  await Promise.all(updates);

  const updated = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, country: true, role: true, referralCode: true,
      agentProfile: { select: { photo: true, fonction: true } },
    },
  });

  return NextResponse.json({ user: updated });
}
