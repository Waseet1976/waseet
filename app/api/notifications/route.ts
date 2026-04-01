/**
 * GET /api/notifications
 * Notifications de l'utilisateur connecté.
 * Query params : isRead (boolean string), limit (number, défaut 30)
 */

import { NextRequest, NextResponse }              from "next/server";
import { prisma }                                 from "@/lib/prisma";
import { extractBearerToken, verifyToken }        from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const isReadParam = searchParams.get("isRead");
  const limit       = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "30")));

  const where: Record<string, unknown> = { userId: payload.userId };
  if (isReadParam !== null) where.isRead = isReadParam === "true";

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take:    limit,
      select: {
        id:        true,
        type:      true,
        title:     true,
        message:   true,
        isRead:    true,
        link:      true,
        createdAt: true,
      },
    }),
    prisma.notification.count({
      where: { userId: payload.userId, isRead: false },
    }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
