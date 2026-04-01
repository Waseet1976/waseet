/**
 * GET /api/admin/stats
 * KPIs globaux, données mensuelles, top apporteurs, répartition géographique, alertes.
 * Réservé aux ADMIN.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";

// 6 derniers mois en labels FR
const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

function last6MonthsRange() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return { start, now };
}

function buildMonthlyBuckets() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { year: d.getFullYear(), month: d.getMonth(), label: MONTHS_FR[d.getMonth()], declarations: 0, sales: 0, commissions: 0 };
  });
}

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { start } = last6MonthsRange();

  const [
    usersByRole,
    propertiesTotal,
    propertiesPending,
    propertiesDuplicates,
    commissionGroups,
    agenciesTotal,
    recentProperties,
    recentCommissions,
    topApporteurs,
    propertiesByCountry,
    pendingAlerts,
  ] = await Promise.all([
    // Utilisateurs par rôle
    prisma.user.groupBy({ by: ["role"], _count: { id: true } }),

    // Biens total
    prisma.property.count(),

    // Biens en attente de validation admin
    prisma.property.count({ where: { adminStatus: "PENDING" } }),

    // Doublons
    prisma.property.count({ where: { isDuplicate: true, adminStatus: "PENDING" } }),

    // Commissions par statut avec sommes
    prisma.commission.groupBy({
      by:     ["status"],
      _count: { id: true },
      _sum:   { estimatedAmount: true, validatedAmount: true },
    }),

    // Agences
    prisma.agency.count({ where: { isActive: true } }),

    // Déclarations 6 derniers mois
    prisma.property.findMany({
      where:  { createdAt: { gte: start } },
      select: { createdAt: true, pipelineStage: true },
    }),

    // Commissions payées 6 derniers mois
    prisma.commission.findMany({
      where:  { status: "PAID", paidAt: { gte: start } },
      select: { paidAt: true, validatedAmount: true, estimatedAmount: true },
    }),

    // Top apporteurs (DEAL_FINDER avec le plus de biens)
    prisma.user.findMany({
      where:   { role: "DEAL_FINDER" },
      orderBy: { declaredProps: { _count: "desc" } },
      take:    5,
      select: {
        id: true, firstName: true, lastName: true, country: true,
        _count:       { select: { declaredProps: true } },
        commissions:  { select: { validatedAmount: true, status: true } },
      },
    }),

    // Répartition géographique
    prisma.property.groupBy({ by: ["country"], _count: { id: true } }),

    // Alertes : biens PENDING depuis plus de 48h
    prisma.property.count({
      where: {
        adminStatus: "PENDING",
        createdAt:   { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      },
    }),
  ]);

  // ── Buckets mensuels ───────────────────────────────────────────────────────
  const buckets = buildMonthlyBuckets();

  for (const p of recentProperties) {
    const y = p.createdAt.getFullYear();
    const m = p.createdAt.getMonth();
    const b = buckets.find((x) => x.year === y && x.month === m);
    if (b) {
      b.declarations++;
      if (p.pipelineStage === "COMMISSION_PAID") b.sales++;
    }
  }

  for (const c of recentCommissions) {
    if (!c.paidAt) continue;
    const y = c.paidAt.getFullYear();
    const m = c.paidAt.getMonth();
    const b = buckets.find((x) => x.year === y && x.month === m);
    if (b) b.commissions += c.validatedAmount ?? c.estimatedAmount ?? 0;
  }

  // ── KPIs utilisateurs ──────────────────────────────────────────────────────
  const userKpis = Object.fromEntries(
    usersByRole.map((r) => [r.role, r._count.id])
  ) as Record<string, number>;

  // ── KPIs commissions ──────────────────────────────────────────────────────
  const commKpis = Object.fromEntries(
    commissionGroups.map((g) => [
      g.status,
      {
        count:     g._count.id,
        estimated: g._sum.estimatedAmount ?? 0,
        validated: g._sum.validatedAmount ?? 0,
      },
    ])
  );

  // ── Top apporteurs enrichis ────────────────────────────────────────────────
  const enrichedTop = topApporteurs.map((u) => ({
    id:          u.id,
    name:        `${u.firstName} ${u.lastName}`,
    country:     u.country,
    properties:  u._count.declaredProps,
    totalEarned: u.commissions
      .filter((c) => c.status === "PAID")
      .reduce((s, c) => s + (c.validatedAmount ?? 0), 0),
  }));

  return NextResponse.json({
    kpis: {
      users:               userKpis,
      propertiesTotal,
      propertiesPending,
      propertiesDuplicates,
      agenciesTotal,
      commissions:         commKpis,
    },
    monthly:       buckets.map(({ label, declarations, sales, commissions }) => ({
      label, declarations, sales, commissions,
    })),
    topApporteurs: enrichedTop,
    geography:     propertiesByCountry.map((g) => ({
      country: g.country ?? "Inconnu",
      count:   g._count.id,
    })),
    alerts: {
      pendingDeclarations: pendingAlerts,
      duplicatesPending:   propertiesDuplicates,
    },
  });
}
