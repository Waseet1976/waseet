import { NextRequest, NextResponse } from "next/server";
import { prisma }                         from "@/lib/prisma";
import { verifyToken, extractBearerToken } from "@/lib/auth";

// ── GET /api/auth/me ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  // 1. Extraire et vérifier le token
  const token   = extractBearerToken(req.headers.get("authorization"));

  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // 2. Charger l'utilisateur complet avec son agence si applicable
  const user = await prisma.user.findUnique({
    where:  { id: payload.userId },
    select: {
      id:           true,
      email:        true,
      firstName:    true,
      lastName:     true,
      phone:        true,
      country:      true,
      role:         true,
      isActive:     true,
      referralCode: true,
      ghlContactId: true,
      agencyId:     true,
      createdAt:    true,
      updatedAt:    true,
      // Profil agent si applicable
      agentProfile: {
        select: { id: true, photo: true, fonction: true },
      },
      // Agence si applicable
      agency: {
        select: {
          id:             true,
          name:           true,
          email:          true,
          phone:          true,
          city:           true,
          country:        true,
          commissionRate: true,
          apporteurShare: true,
          isActive:       true,
        },
      },
      // Notifications non lues (count)
      _count: {
        select: { notifications: { where: { isRead: false } } },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  if (!user.isActive) {
    return NextResponse.json({ error: "Compte désactivé" }, { status: 403 });
  }

  return NextResponse.json({ user });
}
