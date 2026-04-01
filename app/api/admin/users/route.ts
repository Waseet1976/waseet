/**
 * GET  /api/admin/users  — Liste paginée des utilisateurs avec filtres
 * PATCH /api/admin/users  — Action sur un utilisateur (activate, deactivate, changeRole)
 * Réservé aux ADMIN.
 */

import { NextRequest, NextResponse } from "next/server";
import { z }                          from "zod";
import { prisma }                     from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";

const patchSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(["activate", "deactivate", "changeRole"]),
  role:   z.enum(["ADMIN", "AGENCY", "AGENT", "DEAL_FINDER"]).optional(),
});

// ── Vérification admin ────────────────────────────────────────────────────────
function checkAdmin(req: NextRequest) {
  const token   = extractBearerToken(req.headers.get("authorization"));
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const payload = checkAdmin(req);
  if (!payload) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const role      = searchParams.get("role") ?? undefined;
  const q         = searchParams.get("q") ?? undefined;
  const isActive  = searchParams.get("isActive");
  const page      = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit     = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const skip      = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (isActive !== null && isActive !== undefined)
    where.isActive = isActive === "true";
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName:  { contains: q, mode: "insensitive" } },
      { email:     { contains: q, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: "desc" },
      select: {
        id:          true,
        email:       true,
        firstName:   true,
        lastName:    true,
        phone:       true,
        country:     true,
        role:        true,
        isActive:    true,
        referralCode: true,
        createdAt:   true,
        agencyId:    true,
        agency:      { select: { id: true, name: true } },
        agentProfile: { select: { photo: true, fonction: true } },
        _count: {
          select: {
            declaredProps: true,
            commissions:   true,
            referrals:     true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}

// ── PATCH ─────────────────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const payload = checkAdmin(req);
  if (!payload) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const result = patchSchema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Données invalides", field: issue?.path[0] },
      { status: 422 }
    );
  }

  const { userId, action, role } = result.data;

  // Empêcher l'admin de se désactiver lui-même
  if (userId === payload.userId && action === "deactivate")
    return NextResponse.json({ error: "Impossible de se désactiver soi-même" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!target) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  let data: Record<string, unknown> = {};
  if (action === "activate")   data = { isActive: true };
  if (action === "deactivate") data = { isActive: false };
  if (action === "changeRole") {
    if (!role) return NextResponse.json({ error: "Rôle requis" }, { status: 422 });
    data = { role };
  }

  const updated = await prisma.user.update({
    where:  { id: userId },
    data,
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
  });

  return NextResponse.json({ user: updated });
}
