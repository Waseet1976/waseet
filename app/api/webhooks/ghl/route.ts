/**
 * POST /api/webhooks/ghl
 * Reçoit les webhooks GoHighLevel (GHL).
 *
 * GoHighLevel n'a pas de mécanisme de signature normalisé — on vérifie
 * via un secret partagé passé dans le header X-GHL-Webhook-Secret.
 *
 * Événements traités :
 *  - opportunity.stageChanged  → met à jour Property.pipelineStage
 *  - contact.created           → met à jour User.ghlContactId
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/prisma";
import type { PipelineStage }        from "@prisma/client";

// ── Mapping stage GHL → PipelineStage Waseet ──────────────────────────────────
// Les noms de stages GHL correspondent aux labels configurés dans votre pipeline GHL.
const GHL_STAGE_MAP: Record<string, PipelineStage> = {
  "declared":            "DECLARED",
  "validated":           "VALIDATED",
  "in review":           "IN_REVIEW",
  "in_review":           "IN_REVIEW",
  "mandate signed":      "MANDATE_SIGNED",
  "mandate_signed":      "MANDATE_SIGNED",
  "compromise signed":   "COMPROMISE_SIGNED",
  "compromise_signed":   "COMPROMISE_SIGNED",
  "deed signed":         "DEED_SIGNED",
  "deed_signed":         "DEED_SIGNED",
  "commission validated":"COMMISSION_VALIDATED",
  "commission_validated":"COMMISSION_VALIDATED",
  "commission paid":     "COMMISSION_PAID",
  "commission_paid":     "COMMISSION_PAID",
};

function normalizeStageKey(raw: string): string {
  return raw.toLowerCase().trim();
}

export async function POST(req: NextRequest) {
  // ── Vérification du secret ─────────────────────────────────────────────────
  const secret    = process.env.GHL_WEBHOOK_SECRET;
  const incomingSecret = req.headers.get("x-ghl-webhook-secret")
    ?? req.headers.get("x-webhook-secret");

  if (secret && incomingSecret !== secret) {
    console.warn("[webhook/ghl] Secret invalide");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const eventType = (body.type ?? body.event_type ?? "") as string;

  // ── opportunity.stageChanged ───────────────────────────────────────────────
  if (eventType === "opportunity.stageChanged" || eventType === "OpportunityStageChanged") {
    const opportunityId = (body.id ?? body.opportunity_id ?? body.opportunityId) as string | undefined;
    const stageName     = (body.stage_name ?? body.stageName ?? body.pipeline_stage_name) as string | undefined;

    if (!opportunityId || !stageName) {
      return NextResponse.json({ ok: true, skipped: "missing fields" });
    }

    const waseetStage = GHL_STAGE_MAP[normalizeStageKey(stageName)];
    if (!waseetStage) {
      console.warn(`[webhook/ghl] Stage GHL inconnu: "${stageName}"`);
      return NextResponse.json({ ok: true, skipped: "unknown stage" });
    }

    // Trouver le bien via ghlOpportunityId
    const property = await prisma.property.findFirst({
      where:  { ghlOpportunityId: opportunityId },
      select: { id: true, pipelineStage: true },
    });

    if (!property) {
      console.warn(`[webhook/ghl] Bien introuvable pour opportunityId=${opportunityId}`);
      return NextResponse.json({ ok: true, skipped: "property not found" });
    }

    // Ne mettre à jour que si le stage est différent
    if (property.pipelineStage !== waseetStage) {
      await prisma.property.update({
        where: { id: property.id },
        data:  { pipelineStage: waseetStage },
      });

      await prisma.pipelineLog.create({
        data: {
          propertyId: property.id,
          stage:      waseetStage,
          note:       `Synchronisé depuis GoHighLevel (stage: ${stageName})`,
        },
      });
    }

    return NextResponse.json({ ok: true, updated: property.id, stage: waseetStage });
  }

  // ── contact.created ────────────────────────────────────────────────────────
  if (eventType === "contact.created" || eventType === "ContactCreated") {
    const contactId = (body.id ?? body.contact_id ?? body.contactId) as string | undefined;
    const email     = (body.email ?? (body.contact as Record<string, unknown>)?.email) as string | undefined;

    if (!contactId || !email) {
      return NextResponse.json({ ok: true, skipped: "missing fields" });
    }

    // Mettre à jour le ghlContactId sur l'utilisateur correspondant
    await prisma.user.updateMany({
      where: { email, ghlContactId: null },
      data:  { ghlContactId: contactId },
    });

    return NextResponse.json({ ok: true, contactId });
  }

  // Événement non géré → 200 (GHL peut renvoyer beaucoup d'événements)
  return NextResponse.json({ ok: true, event: eventType, skipped: "unhandled" });
}
