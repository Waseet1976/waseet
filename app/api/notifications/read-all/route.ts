/**
 * PATCH /api/notifications/read-all
 * Marque toutes les notifications non lues de l'utilisateur connecté comme lues.
 */

import { NextRequest, NextResponse }       from "next/server";
import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const { count } = await prisma.notification.updateMany({
    where: { userId: payload.userId, isRead: false },
    data:  { isRead: true },
  });

  return NextResponse.json({ updated: count });
}
