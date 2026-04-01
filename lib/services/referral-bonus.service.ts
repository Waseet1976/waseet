/**
 * referral-bonus.service.ts
 * Attribution du bonus de parrainage quand une commission est payée.
 * Règle : le parrain reçoit 250 € à la première vente conclue par son filleul.
 */

import { prisma }                from "@/lib/prisma";
import { BONUS_REFERRAL_AMOUNT } from "@/lib/config";

// ── Service principal ──────────────────────────────────────────────────────────

/**
 * Vérifie si l'apporteur d'un bien a un parrain, et lui attribue le bonus
 * si ce n'est pas encore fait.
 *
 * @param propertyId  L'ID du bien dont la commission vient d'être payée.
 * @returns           { referralId, amount, currency } ou null si pas de bonus.
 */
export async function checkAndAttributeBonus(
  propertyId: string
): Promise<{ referralId: string; amount: number; currency: string } | null> {

  // 1. Récupérer le bien + déclarant + son parrain éventuel
  const property = await prisma.property.findUnique({
    where:   { id: propertyId },
    include: {
      declaredBy: {
        select: {
          id:          true,
          firstName:   true,
          lastName:    true,
          country:     true,
          referredById: true,
        },
      },
    },
  });

  const apporteur = property?.declaredBy;

  // Pas de parrain → pas de bonus
  if (!apporteur?.referredById) return null;

  // 2. Trouver le Referral liant parrain → filleul
  const referral = await prisma.referral.findUnique({
    where: {
      referrerId_referredId: {
        referrerId: apporteur.referredById,
        referredId: apporteur.id,
      },
    },
  });

  // Déjà payé ou inexistant
  if (!referral || referral.bonusPaid) return null;

  const currency = "EUR";

  // 4. Attribuer le bonus
  await prisma.referral.update({
    where: { id: referral.id },
    data:  {
      bonusAmount: BONUS_REFERRAL_AMOUNT,
      bonusPaid:   true,
    },
  });

  // 5. Notification au parrain
  await prisma.notification.create({
    data: {
      userId:  apporteur.referredById,
      type:    "REFERRAL_BONUS",
      title:   "Bonus parrainage débloqué !",
      message: `Votre filleul ${apporteur.firstName} ${apporteur.lastName} a conclu une première vente. `
        + `Bonus : ${BONUS_REFERRAL_AMOUNT.toLocaleString("fr-FR")} ${currency} crédité sur votre compte.`,
      link: "/referrals",
    },
  });

  return { referralId: referral.id, amount: BONUS_REFERRAL_AMOUNT, currency };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Retourne le résumé du parrainage pour un utilisateur (parrain). */
export async function getReferralSummary(referrerId: string) {
  const referrals = await prisma.referral.findMany({
    where:   { referrerId },
    include: {
      referred: {
        select: { firstName: true, lastName: true, createdAt: true, country: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const paid    = referrals.filter((r) => r.bonusPaid);
  const pending = referrals.filter((r) => !r.bonusPaid);

  return {
    total:         referrals.length,
    bonusPaidCount: paid.length,
    bonusPendingCount: pending.length,
    totalBonusPaid: paid.reduce((s, r) => s + (r.bonusAmount ?? 0), 0),
    referrals,
  };
}
