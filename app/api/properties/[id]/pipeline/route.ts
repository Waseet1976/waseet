/**
 * PATCH /api/properties/[id]/pipeline
 * Route complète de changement d'étape pipeline :
 *   - Permissions (ADMIN | AGENCY assignée)
 *   - Progression sens unique
 *   - PipelineLog
 *   - Commission auto (DEED_SIGNED)
 *   - Bonus parrainage (COMMISSION_PAID)
 *   - Notification apporteur
 *   - Email SendGrid (si configuré)
 *   - Webhook GHL (si configuré)
 */

import { NextRequest, NextResponse } from "next/server";
import type { PipelineStage }         from "@prisma/client";

import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import { PIPELINE_STAGES, APP_URL }        from "@/lib/config";
import { createCommissionForProperty }     from "@/lib/services/commission.service";
import { checkAndAttributeBonus }          from "@/lib/services/referral-bonus.service";
import { updateOpportunityStage }          from "@/lib/services/ghl.service";
import { sendSMS, sendWhatsApp }           from "@/lib/services/notification.service";

// ── Ordre des stages ──────────────────────────────────────────────────────────
const STAGE_ORDER: PipelineStage[] = Object.keys(PIPELINE_STAGES) as PipelineStage[];

// ── Helpers ───────────────────────────────────────────────────────────────────
async function sendStageEmail(opts: {
  to:         string;
  name:       string;
  reference:  string;
  stageLabel: string;
  note?:      string;
  country:    string | null;
}) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return; // silencieux si non configuré

  const subject = `Waseet – Votre bien ${opts.reference} a avancé : ${opts.stageLabel}`;
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;padding:24px">
      <div style="background:#1C1C1A;border-radius:12px;padding:24px;margin-bottom:20px;text-align:center">
        <h1 style="color:#C9973A;font-size:24px;margin:0">Waseet</h1>
        <p style="color:#fff;opacity:.6;margin:4px 0 0;font-size:13px">Plateforme immobilière</p>
      </div>
      <p style="font-size:15px;color:#1C1C1A">Bonjour ${opts.name},</p>
      <p style="font-size:14px;color:#3C3C3A">
        Votre bien <strong style="color:#C9973A">${opts.reference}</strong> vient de passer à l'étape :
      </p>
      <div style="background:#F5F0E8;border-left:4px solid #C9973A;border-radius:8px;padding:16px;margin:16px 0">
        <p style="font-size:18px;font-weight:700;color:#1C1C1A;margin:0">${opts.stageLabel}</p>
        ${opts.note ? `<p style="font-size:13px;color:#6B7280;margin:8px 0 0">${opts.note}</p>` : ""}
      </div>
      <a href="${APP_URL}/properties" style="display:inline-block;background:#C9973A;color:#fff;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px">
        Voir mon bien →
      </a>
      <p style="font-size:11px;color:#9CA3AF;margin-top:24px">
        Waseet · Plateforme immobilière multimarché
      </p>
    </div>
  `;

  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: opts.to }] }],
      from:    { email: "noreply@waseet.com", name: "Waseet" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  }).catch(() => {}); // ne jamais bloquer la réponse si l'email échoue
}

// ── PATCH handler ─────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Auth ──────────────────────────────────────────────────────────────────
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  // 2. Permission ────────────────────────────────────────────────────────────
  // Seuls ADMIN et AGENCY peuvent avancer le pipeline
  const isAdmin  = payload.role === "ADMIN";
  const isAgency = payload.role === "AGENCY";
  if (!isAdmin && !isAgency) {
    return NextResponse.json({ error: "Permission insuffisante" }, { status: 403 });
  }

  // 3. Body ──────────────────────────────────────────────────────────────────
  let body: { newStage?: string; note?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const { newStage, note } = body;

  if (!newStage || !STAGE_ORDER.includes(newStage as PipelineStage)) {
    return NextResponse.json({ error: "Stage invalide" }, { status: 422 });
  }

  // 4. Charger le bien ───────────────────────────────────────────────────────
  const property = await prisma.property.findUnique({
    where:   { id: params.id },
    include: {
      declaredBy: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
      agency: { select: { id: true } },
    },
  });
  if (!property) return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });

  // Pour AGENCY, vérifier qu'elle est bien l'agence assignée
  if (isAgency) {
    const userAgency = await prisma.user.findUnique({
      where: { id: payload.userId }, select: { agencyId: true },
    });
    if (userAgency?.agencyId !== property.agencyId) {
      return NextResponse.json({ error: "Ce bien n'est pas assigné à votre agence" }, { status: 403 });
    }
  }

  // 5. Vérification sens unique ──────────────────────────────────────────────
  const currentIdx = STAGE_ORDER.indexOf(property.pipelineStage);
  const newIdx     = STAGE_ORDER.indexOf(newStage as PipelineStage);

  if (newIdx <= currentIdx) {
    return NextResponse.json(
      { error: `Pipeline sens unique : impossible de revenir de ${property.pipelineStage} à ${newStage}` },
      { status: 400 }
    );
  }

  // 6. Dates automatiques ────────────────────────────────────────────────────
  const datePatch: Record<string, Date> = {};
  if (newStage === "MANDATE_SIGNED")    datePatch.mandateSignedAt    = new Date();
  if (newStage === "COMPROMISE_SIGNED") datePatch.compromiseSignedAt = new Date();
  if (newStage === "DEED_SIGNED")       datePatch.deedSignedAt       = new Date();

  // 7. Mise à jour Prisma ────────────────────────────────────────────────────
  const updated = await prisma.property.update({
    where: { id: params.id },
    data:  { pipelineStage: newStage as PipelineStage, ...datePatch },
  });

  // 8. PipelineLog ───────────────────────────────────────────────────────────
  await prisma.pipelineLog.create({
    data: {
      propertyId:  params.id,
      stage:       newStage as PipelineStage,
      changedById: payload.userId,
      note:        note ?? null,
    },
  });

  // 9. Commission automatique si DEED_SIGNED ─────────────────────────────────
  let commission = null;
  if (newStage === "DEED_SIGNED") {
    commission = await createCommissionForProperty(params.id);
  }

  // 10. Bonus parrainage si COMMISSION_PAID ──────────────────────────────────
  let bonusResult = null;
  if (newStage === "COMMISSION_PAID") {
    bonusResult = await checkAndAttributeBonus(params.id);
  }

  // 11. Notification apporteur ───────────────────────────────────────────────
  const stageLabel = PIPELINE_STAGES[newStage as PipelineStage].label;
  await prisma.notification.create({
    data: {
      userId:  property.declaredById,
      type:    "PIPELINE_UPDATED",
      title:   `Bien ${property.reference} : ${stageLabel}`,
      message: [
        `Votre bien à ${property.city ?? ""} vient de passer à l'étape "${stageLabel}".`,
        note ? `Note : ${note}` : "",
      ].filter(Boolean).join(" "),
      link: `/properties/${params.id}`,
    },
  });

  // 12. Email SendGrid ───────────────────────────────────────────────────────
  await sendStageEmail({
    to:         property.declaredBy.email,
    name:       `${property.declaredBy.firstName} ${property.declaredBy.lastName}`,
    reference:  property.reference,
    stageLabel,
    note:       note ?? undefined,
    country:    property.country,
  });

  // 13. GHL — mettre à jour le stage de l'opportunité (fire-and-forget) ───────
  if (property.ghlOpportunityId) {
    updateOpportunityStage(property.ghlOpportunityId, newStage as PipelineStage)
      .catch(() => {});
  }

  // 14. SMS + WhatsApp Twilio (fire-and-forget) ─────────────────────────────
  const phone = property.declaredBy.phone;
  if (phone) {
    const smsText = `Waseet | Bien ${property.reference} : ${stageLabel}${note ? ` — ${note}` : ""}. Voir : ${APP_URL}/properties`;
    sendSMS(phone, smsText).catch(() => {});
    sendWhatsApp(phone, smsText).catch(() => {});
  }

  return NextResponse.json({
    property:      updated,
    stage:         newStage,
    commission,
    bonusResult,
  });
}
