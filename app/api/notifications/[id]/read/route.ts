/**
 * PATCH /api/notifications/[id]/read
 * Marque une notification comme lue.
 * L'utilisateur ne peut marquer que ses propres notifications.
 */

import { NextRequest, NextResponse }       from "next/server";
import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const notif = await prisma.notification.findUnique({
    where:  { id: params.id },
    select: { id: true, userId: true },
  });

  if (!notif) return NextResponse.json({ error: "Notification introuvable" }, { status: 404 });
  if (notif.userId !== payload.userId)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const updated = await prisma.notification.update({
    where: { id: params.id },
    data:  { isRead: true },
    select: { id: true, isRead: true },
  });

  return NextResponse.json({ notification: updated });
}
