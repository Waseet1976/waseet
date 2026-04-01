import { NextRequest, NextResponse }        from "next/server";
import { prisma }                           from "@/lib/prisma";
import { verifyToken, extractBearerToken }  from "@/lib/auth";

// ── GET /api/dashboard/stats ──────────────────────────────────
export async function GET(req: NextRequest) {
  // 1. Auth
  const token   = extractBearerToken(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = payload.userId;

  // 2. Toutes les requêtes en parallèle
  const [user, properties, commissions, referrals, recentProperties] =
    await Promise.all([
      // Utilisateur
      prisma.user.findUnique({
        where:  { id: userId },
        select: {
          id: true, firstName: true, lastName: true,
          email: true, role: true, country: true,
          referralCode: true, createdAt: true,
        },
      }),

      // Propriétés déclarées
      prisma.property.findMany({
        where:  { declaredById: userId },
        select: { pipelineStage: true, adminStatus: true, isPriority: true },
      }),

      // Commissions
      prisma.commission.findMany({
        where:  { apporteurId: userId },
        select: { status: true, estimatedAmount: true, validatedAmount: true },
      }),

      // Filleuls
      prisma.referral.findMany({
        where:  { referrerId: userId },
        select: {
          bonusAmount: true,
          bonusPaid:   true,
          createdAt:   true,
          referred: {
            select: { firstName: true, lastName: true, createdAt: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // Biens récents (5 derniers)
      prisma.property.findMany({
        where:   { declaredById: userId },
        orderBy: { createdAt: "desc" },
        take:    5,
        select: {
          id: true, reference: true, city: true, neighborhood: true,
          address: true, propertyType: true, estimatedPrice: true,
          pipelineStage: true, adminStatus: true,
          isPriority: true, country: true, createdAt: true,
          photos: true,
        },
      }),
    ]);

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // 3. Calcul des stats propriétés
  const totalProperties  = properties.length;
  const activeProperties = properties.filter(
    (p) => p.pipelineStage !== "COMMISSION_PAID"
  ).length;
  const paidProperties   = properties.filter(
    (p) => p.pipelineStage === "COMMISSION_PAID"
  ).length;

  // Pipeline : count par stage
  const pipeline = properties.reduce<Record<string, number>>((acc, p) => {
    acc[p.pipelineStage] = (acc[p.pipelineStage] ?? 0) + 1;
    return acc;
  }, {});

  // 4. Calcul des stats commissions
  const pendingCommissions = commissions
    .filter((c) => c.status === "ESTIMATED")
    .reduce((sum, c) => sum + (c.estimatedAmount ?? 0), 0);

  const validatedCommissions = commissions
    .filter((c) => c.status === "VALIDATED")
    .reduce((sum, c) => sum + (c.validatedAmount ?? 0), 0);

  const paidCommissions = commissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + (c.validatedAmount ?? 0), 0);

  // 5. Stats filleuls
  const referralStats = {
    total:         referrals.length,
    bonusPaid:     referrals.filter((r) => r.bonusPaid).length,
    bonusPending:  referrals.filter((r) => !r.bonusPaid).length,
    totalBonus:    referrals.filter((r) => r.bonusPaid).reduce((sum, r) => sum + r.bonusAmount, 0),
    referredUsers: referrals.slice(0, 5).map((r) => ({
      firstName:  r.referred.firstName,
      lastName:   r.referred.lastName,
      role:       r.referred.role,
      createdAt:  r.referred.createdAt,
      bonusPaid:  r.bonusPaid,
    })),
  };

  return NextResponse.json({
    user,
    stats: {
      totalProperties,
      activeProperties,
      paidProperties,
      pendingCommissions,
      validatedCommissions,
      paidCommissions,
    },
    pipeline,
    recentProperties,
    referralStats,
  });
}
