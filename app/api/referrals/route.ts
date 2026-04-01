/**
 * GET /api/referrals
 * Statistiques et liste des filleuls pour l'utilisateur connecté.
 */

import { NextRequest, NextResponse } from "next/server";

import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const userId = payload.userId;

  // 1. Récupérer le code de parrainage + les filleuls
  const [user, referrals] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: userId },
      select: { referralCode: true, country: true, firstName: true, lastName: true },
    }),
    prisma.referral.findMany({
      where:   { referrerId: userId },
      include: {
        referred: {
          select: {
            id:        true,
            firstName: true,
            lastName:  true,
            country:   true,
            createdAt: true,
            _count:    { select: { declaredProps: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const filleulIds = referrals.map((r) => r.referredId);

  // 2. Stats réseau
  const [networkProperties, networkSales, bonusAggregate] = await Promise.all([
    filleulIds.length
      ? prisma.property.count({ where: { declaredById: { in: filleulIds } } })
      : Promise.resolve(0),

    filleulIds.length
      ? prisma.property.count({
          where: {
            declaredById:  { in: filleulIds },
            pipelineStage: { in: ["DEED_SIGNED", "COMMISSION_VALIDATED", "COMMISSION_PAID"] },
          },
        })
      : Promise.resolve(0),

    prisma.referral.aggregate({
      where: { referrerId: userId, bonusPaid: true },
      _sum:  { bonusAmount: true },
    }),
  ]);

  const totalBonusReceived = bonusAggregate._sum.bonusAmount ?? 0;

  // 3. Données mensuelles (6 derniers mois) pour le graphique
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // Construire les 6 derniers mois
  const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
                     "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month:  MONTHS_FR[d.getMonth()],
      year:   d.getFullYear(),
      monthN: d.getMonth(),
      count:  0,
    };
  });

  // Remplir depuis les referrals existants
  referrals.forEach((r) => {
    const d = new Date(r.createdAt);
    const slot = monthlyData.find(
      (m) => m.monthN === d.getMonth() && m.year === d.getFullYear()
    );
    if (slot) slot.count++;
  });

  // 4. Top filleuls (par nombre de biens déclarés)
  const topReferrals = [...referrals]
    .sort((a, b) => b.referred._count.declaredProps - a.referred._count.declaredProps)
    .slice(0, 3);

  // 5. Activité des filleuls (déclaré un bien dans les 30 derniers jours)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let recentlyActiveIds: string[] = [];
  if (filleulIds.length) {
    const recentProps = await prisma.property.findMany({
      where: { declaredById: { in: filleulIds }, declaredAt: { gte: thirtyDaysAgo } },
      select: { declaredById: true },
      distinct: ["declaredById"],
    });
    recentlyActiveIds = recentProps.map((p) => p.declaredById);
  }

  // 6. Enrichir les referrals avec le statut d'activité
  const enrichedReferrals = referrals.map((r) => ({
    id:          r.id,
    bonusAmount: r.bonusAmount,
    bonusPaid:   r.bonusPaid,
    createdAt:   r.createdAt,
    isActive:    recentlyActiveIds.includes(r.referredId),
    referred:    r.referred,
  }));

  return NextResponse.json({
    referralCode: user.referralCode,
    country:      user.country,
    user:         { firstName: user.firstName, lastName: user.lastName },
    stats: {
      filleulsCount:         referrals.length,
      networkPropertiesCount: networkProperties,
      networkSalesCount:     networkSales,
      totalBonusReceived,
      bonusPaidCount:        referrals.filter((r) => r.bonusPaid).length,
    },
    referrals:    enrichedReferrals,
    topReferrals: topReferrals.map((r) => ({
      ...r,
      isActive: recentlyActiveIds.includes(r.referredId),
    })),
    monthlyData: monthlyData.map((m) => ({ month: m.month, count: m.count })),
  });
}
