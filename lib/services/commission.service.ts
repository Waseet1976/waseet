/**
 * commission.service.ts
 * Toute la logique métier liée aux commissions apporteur.
 * Importé par les routes API — ne pas appeler côté client.
 */

import { prisma }    from "@/lib/prisma";
import {
  DEFAULT_COMMISSION_RATE,
  DEFAULT_APPORTEUR_SHARE,
  PIPELINE_STAGES,
} from "@/lib/config";
import type { CommissionStatus } from "@prisma/client";

// ── Calcul ─────────────────────────────────────────────────────────────────────

/**
 * Calcule la commission agence et la part apporteur à partir du prix.
 * commissionRate  = % sur le prix (ex : 2.5 → 2,5 %)
 * apporteurShare  = % de la commission agence pour l'apporteur (ex : 40 → 40 %)
 */
export function calculateCommission(
  price:          number,
  commissionRate  = DEFAULT_COMMISSION_RATE,
  apporteurShare  = DEFAULT_APPORTEUR_SHARE
): { agencyCommission: number; apporteurAmount: number; commissionRate: number; apporteurShare: number } {
  const agencyCommission = Math.round((price * commissionRate) / 100);
  const apporteurAmount  = Math.round((agencyCommission * apporteurShare) / 100);
  return { agencyCommission, apporteurAmount, commissionRate, apporteurShare };
}

// ── Création ───────────────────────────────────────────────────────────────────

/**
 * Crée la commission pour un bien si elle n'existe pas encore.
 * Utilise le taux de l'agence liée, ou les valeurs par défaut.
 */
export async function createCommissionForProperty(propertyId: string) {
  const property = await prisma.property.findUnique({
    where:   { id: propertyId },
    include: {
      agency: { select: { commissionRate: true, apporteurShare: true } },
    },
  });

  if (!property?.estimatedPrice) return null;

  // Éviter les doublons
  const existing = await prisma.commission.findFirst({ where: { propertyId } });
  if (existing) return existing;

  const commRate   = property.agency?.commissionRate ?? DEFAULT_COMMISSION_RATE;
  const partApport = property.agency?.apporteurShare ?? DEFAULT_APPORTEUR_SHARE;
  const { apporteurAmount } = calculateCommission(
    property.estimatedPrice,
    commRate,
    partApport
  );

  return prisma.commission.create({
    data: {
      propertyId,
      apporteurId:     property.declaredById,
      agencyId:        property.agencyId ?? null,
      estimatedAmount: apporteurAmount,
      status:          "ESTIMATED",
    },
  });
}

// ── Validation ─────────────────────────────────────────────────────────────────

/**
 * Valide une commission (ADMIN seulement).
 * Avance aussi le pipeline → COMMISSION_VALIDATED.
 */
export async function validateCommission(
  commissionId:    string,
  validatedAmount: number
) {
  const commission = await prisma.commission.findUnique({
    where:   { id: commissionId },
    include: { property: { select: { id: true, pipelineStage: true, reference: true } } },
  });
  if (!commission) throw new Error("Commission introuvable");

  const updated = await prisma.commission.update({
    where: { id: commissionId },
    data:  { validatedAmount, status: "VALIDATED" },
  });

  // Avancer le pipeline si besoin
  const stageOrder = Object.keys(PIPELINE_STAGES);
  const curIdx = stageOrder.indexOf(commission.property.pipelineStage);
  const valIdx = stageOrder.indexOf("COMMISSION_VALIDATED");

  if (curIdx < valIdx) {
    await prisma.property.update({
      where: { id: commission.property.id },
      data:  { pipelineStage: "COMMISSION_VALIDATED" },
    });
    await prisma.pipelineLog.create({
      data: {
        propertyId: commission.property.id,
        stage:      "COMMISSION_VALIDATED",
        note:       `Commission validée — ${validatedAmount.toLocaleString("fr-FR")}`,
      },
    });
  }

  // Notification apporteur
  await prisma.notification.create({
    data: {
      userId:  commission.apporteurId,
      type:    "COMMISSION_VALIDATED",
      title:   "Commission validée",
      message: `Réf. ${commission.property.reference} — Votre commission de ${validatedAmount.toLocaleString("fr-FR")} a été validée.`,
      link:    "/commissions",
    },
  });

  return updated;
}

// ── Paiement ───────────────────────────────────────────────────────────────────

/**
 * Marque une commission comme payée (ADMIN seulement).
 * Avance le pipeline → COMMISSION_PAID.
 */
export async function payCommission(commissionId: string) {
  const commission = await prisma.commission.findUnique({
    where:   { id: commissionId },
    include: {
      property: { select: { id: true, pipelineStage: true, reference: true } },
    },
  });
  if (!commission) throw new Error("Commission introuvable");
  if (commission.status === "PAID") throw new Error("Commission déjà payée");

  const updated = await prisma.commission.update({
    where: { id: commissionId },
    data:  { status: "PAID", paidAt: new Date() },
  });

  // Avancer pipeline → COMMISSION_PAID
  const stageOrder = Object.keys(PIPELINE_STAGES);
  const curIdx = stageOrder.indexOf(commission.property.pipelineStage);
  const paidIdx = stageOrder.indexOf("COMMISSION_PAID");

  if (curIdx < paidIdx) {
    await prisma.property.update({
      where: { id: commission.property.id },
      data:  { pipelineStage: "COMMISSION_PAID" },
    });
    await prisma.pipelineLog.create({
      data: {
        propertyId: commission.property.id,
        stage:      "COMMISSION_PAID",
        note:       "Commission payée à l'apporteur",
      },
    });
  }

  // Notification apporteur
  await prisma.notification.create({
    data: {
      userId:  commission.apporteurId,
      type:    "COMMISSION_PAID",
      title:   "💰 Commission payée !",
      message: `Réf. ${commission.property.reference} — Votre commission a été versée. Félicitations !`,
      link:    "/commissions",
    },
  });

  return updated;
}

// ── Stats ──────────────────────────────────────────────────────────────────────

/** Totaux par statut pour un apporteur (ou tous si apporteurId = null). */
export async function getCommissionStats(apporteurId?: string) {
  const where = apporteurId ? { apporteurId } : {};

  const [estimated, validated, paid] = await Promise.all([
    prisma.commission.aggregate({
      where: { ...where, status: "ESTIMATED" as CommissionStatus },
      _sum:  { estimatedAmount: true },
      _count: true,
    }),
    prisma.commission.aggregate({
      where: { ...where, status: "VALIDATED" as CommissionStatus },
      _sum:  { validatedAmount: true },
      _count: true,
    }),
    prisma.commission.aggregate({
      where: { ...where, status: "PAID" as CommissionStatus },
      _sum:  { validatedAmount: true },
      _count: true,
    }),
  ]);

  return {
    estimated: { total: estimated._sum.estimatedAmount ?? 0, count: estimated._count },
    validated: { total: validated._sum.validatedAmount ?? 0, count: validated._count },
    paid:      { total: paid._sum.validatedAmount      ?? 0, count: paid._count      },
  };
}
