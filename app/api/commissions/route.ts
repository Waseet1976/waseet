/**
 * GET /api/commissions
 * Liste les commissions selon le rôle.
 * Filtres : status, dateFrom, dateTo
 */

import { NextRequest, NextResponse }  from "next/server";
import type { CommissionStatus }       from "@prisma/client";
import type { Prisma }                 from "@prisma/client";

import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import { getCommissionStats }              from "@/lib/services/commission.service";

const VALID_STATUSES: CommissionStatus[] = ["ESTIMATED", "VALIDATED", "PAID"];

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status   = searchParams.get("status")   ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo   = searchParams.get("dateTo")   ?? "";

  // ── Filtre de base selon le rôle ──────────────────────────────────────────
  const where: Prisma.CommissionWhereInput = {};

  if (payload.role === "DEAL_FINDER") {
    // Voit seulement ses propres commissions
    where.apporteurId = payload.userId;
  } else if (payload.role === "AGENT") {
    // Voit les commissions des biens qui lui sont assignés
    const agent = await prisma.agent.findUnique({
      where:  { userId: payload.userId },
      select: { id: true },
    });
    if (!agent) return NextResponse.json({ commissions: [], stats: null });
    where.property = { assignedAgentId: agent.id };
  } else if (payload.role === "AGENCY") {
    // Voit les commissions de son agence
    const user = await prisma.user.findUnique({
      where:  { id: payload.userId },
      select: { agencyId: true },
    });
    if (user?.agencyId) where.agencyId = user.agencyId;
  }
  // ADMIN → tout voit, pas de filtre additionnel

  // ── Filtres optionnels ────────────────────────────────────────────────────
  if (status && VALID_STATUSES.includes(status as CommissionStatus)) {
    where.status = status as CommissionStatus;
  }
  if (dateFrom) {
    where.createdAt = { ...where.createdAt as object, gte: new Date(dateFrom) };
  }
  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    where.createdAt = { ...where.createdAt as object, lte: end };
  }

  const [commissions, stats] = await Promise.all([
    prisma.commission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            id:             true,
            reference:      true,
            city:           true,
            propertyType:   true,
            estimatedPrice: true,
            country:        true,
            agency: {
              select: { commissionRate: true, apporteurShare: true, name: true },
            },
          },
        },
        apporteur: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    }),
    // Stats agrégées selon le même scope
    getCommissionStats(
      payload.role === "DEAL_FINDER" ? payload.userId : undefined
    ),
  ]);

  return NextResponse.json({ commissions, stats });
}
