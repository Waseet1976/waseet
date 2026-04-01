import { NextRequest, NextResponse } from "next/server";
import type { PipelineStage }         from "@prisma/client";

import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import { PIPELINE_STAGES, DEFAULT_COMMISSION_RATE, DEFAULT_APPORTEUR_SHARE } from "@/lib/config";
import { calculateCommission }             from "@/lib/utils";

// ── Ordre des stages ──────────────────────────────────────────────────────────
const STAGE_ORDER: PipelineStage[] = [
  "DECLARED", "VALIDATED", "IN_REVIEW", "MANDATE_SIGNED",
  "COMPROMISE_SIGNED", "DEED_SIGNED", "COMMISSION_VALIDATED", "COMMISSION_PAID",
];

// ── GET /api/properties/[id] ──────────────────────────────────────────────────
// Retourne le détail complet d'un bien.
// Règle : le propriétaire (ownerPhone/Email) est masqué pour les DEAL_FINDER.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      declaredBy: {
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
      },
      assignedAgent: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      pipelineLogs: {
        orderBy: { createdAt: "asc" },
        include: {
          changedBy: {
            select: { firstName: true, lastName: true, role: true },
          },
        },
      },
      commissions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!property) {
    return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });
  }

  // Contrôle d'accès : DEAL_FINDER ne voit que ses propres biens
  if (payload.role === "DEAL_FINDER" && property.declaredById !== payload.userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Masquer les coordonnées propriétaire pour DEAL_FINDER et AGENT
  const canSeeContact = ["ADMIN", "AGENCY"].includes(payload.role);
  const sanitized = {
    ...property,
    ownerPhone: canSeeContact ? property.ownerPhone : "••••••••••",
    ownerEmail: canSeeContact ? property.ownerEmail : (property.ownerEmail ? "••••@••••" : null),
  };

  return NextResponse.json({ property: sanitized });
}

// ── PATCH /api/properties/[id] ────────────────────────────────────────────────
// Modifie le pipeline stage d'un bien.
// Règles :
//   - Seulement ADMIN ou AGENCY
//   - Pipeline sens unique (jamais en arrière)
//   - Dates automatiques (mandateSignedAt, compromiseSignedAt, deedSignedAt)
//   - Commission auto créée si stage = DEED_SIGNED
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  if (!["ADMIN", "AGENCY"].includes(payload.role)) {
    return NextResponse.json({ error: "Permission insuffisante" }, { status: 403 });
  }

  let body: { stage?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { stage, note } = body;

  if (!stage || !STAGE_ORDER.includes(stage as PipelineStage)) {
    return NextResponse.json({ error: "Stage invalide" }, { status: 422 });
  }

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });

  // Vérification sens unique
  const currentIdx = STAGE_ORDER.indexOf(property.pipelineStage);
  const newIdx     = STAGE_ORDER.indexOf(stage as PipelineStage);

  if (newIdx <= currentIdx) {
    return NextResponse.json(
      { error: `Le pipeline ne peut pas reculer (${property.pipelineStage} → ${stage})` },
      { status: 400 }
    );
  }

  // Dates automatiques selon le stage
  const dateUpdate: Record<string, unknown> = {};
  if (stage === "MANDATE_SIGNED")    dateUpdate.mandateSignedAt    = new Date();
  if (stage === "COMPROMISE_SIGNED") dateUpdate.compromiseSignedAt = new Date();
  if (stage === "DEED_SIGNED")       dateUpdate.deedSignedAt       = new Date();

  const updated = await prisma.property.update({
    where: { id: params.id },
    data:  { pipelineStage: stage as PipelineStage, ...dateUpdate },
  });

  // Log pipeline
  await prisma.pipelineLog.create({
    data: {
      propertyId:  params.id,
      stage:       stage as PipelineStage,
      changedById: payload.userId,
      note:        note ?? null,
    },
  });

  // ── Commission automatique si DEED_SIGNED ─────────────────────────────────
  if (stage === "DEED_SIGNED" && property.estimatedPrice) {
    const existingComm = await prisma.commission.findFirst({
      where: { propertyId: params.id },
    });

    if (!existingComm) {
      const agency = property.agencyId
        ? await prisma.agency.findUnique({ where: { id: property.agencyId } })
        : null;

      const { apporteurShare: estimatedAmount } = calculateCommission(
        property.estimatedPrice,
        agency?.commissionRate ?? DEFAULT_COMMISSION_RATE,
        agency?.apporteurShare ?? DEFAULT_APPORTEUR_SHARE
      );

      await prisma.commission.create({
        data: {
          propertyId:      params.id,
          apporteurId:     property.declaredById,
          agencyId:        property.agencyId ?? null,
          estimatedAmount: Math.round(estimatedAmount),
          status:          "ESTIMATED",
        },
      });
    }
  }

  // Notification apporteur pour changement de stage
  const stageLabel = PIPELINE_STAGES[stage as PipelineStage]?.label ?? stage;
  await prisma.notification.create({
    data: {
      userId:  property.declaredById,
      type:    "PIPELINE_UPDATED",
      title:   `Votre bien a avancé : ${stageLabel}`,
      message: `Réf. ${property.reference} — Nouvelle étape : ${stageLabel}.${note ? ` Note : ${note}` : ""}`,
      link:    `/properties/${params.id}`,
    },
  });

  return NextResponse.json({ property: updated, stage });
}
