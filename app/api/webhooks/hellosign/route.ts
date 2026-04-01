/**
 * POST /api/webhooks/hellosign
 * Webhook HelloSign (Dropbox Sign).
 * HelloSign envoie un POST multipart/form-data avec un champ "json".
 * Répond { hello: "world" } pour accuser réception.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/prisma";
import { createNotification }        from "@/lib/services/notification.service";
import type { PipelineStage }        from "@prisma/client";

// Mapping type contrat → étape pipeline
const STAGE_MAP: Record<string, PipelineStage> = {
  MANDATE:    "MANDATE_SIGNED",
  COMPROMISE: "COMPROMISE_SIGNED",
  DEED:       "DEED_SIGNED",
};

// Champs de date à mettre à jour selon le type
const DATE_FIELD_MAP: Record<string, string> = {
  MANDATE:    "mandateSignedAt",
  COMPROMISE: "compromiseSignedAt",
  DEED:       "deedSignedAt",
};

export async function POST(req: NextRequest) {
  let eventData: Record<string, unknown>;

  try {
    // HelloSign envoie soit JSON brut, soit form-data avec champ "json"
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      eventData = await req.json() as Record<string, unknown>;
    } else {
      // multipart/form-data ou application/x-www-form-urlencoded
      const form = await req.formData();
      const json = form.get("json");
      if (!json || typeof json !== "string")
        return NextResponse.json({ hello: "world" });
      eventData = JSON.parse(json) as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json({ hello: "world" });
  }

  const event            = eventData.event as Record<string, unknown> | undefined;
  const signatureRequest = eventData.signature_request as Record<string, unknown> | undefined;

  if (!event || !signatureRequest) return NextResponse.json({ hello: "world" });

  const eventType        = event.event_type as string;
  const signatureReqId   = signatureRequest.signature_request_id as string;

  // ── Tous ont signé ──────────────────────────────────────────────────────────
  if (eventType === "signature_request_all_signed") {
    const contract = await prisma.contract.findFirst({
      where:   { hellosignRequestId: signatureReqId },
      include: {
        property: {
          select: { id: true, reference: true, declaredById: true, pipelineStage: true },
        },
      },
    });

    if (contract) {
      // Marquer le contrat comme signé
      await prisma.contract.update({
        where: { id: contract.id },
        data:  { status: "SIGNED", signedAt: new Date() },
      });

      // Avancer le pipeline + mettre à jour la date selon le type
      const nextStage = STAGE_MAP[contract.type];
      if (nextStage) {
        const dateField = DATE_FIELD_MAP[contract.type];
        await prisma.property.update({
          where: { id: contract.propertyId },
          data:  {
            pipelineStage: nextStage,
            ...(dateField ? { [dateField]: new Date() } : {}),
          },
        });

        await prisma.pipelineLog.create({
          data: {
            propertyId:  contract.propertyId,
            stage:       nextStage,
            changedById: contract.userId,
            note:        `Contrat ${contract.type} signé électroniquement via HelloSign`,
          },
        });
      }

      // Notifier l'apporteur
      await createNotification(
        contract.property.declaredById,
        "CONTRACT_SIGNED",
        "Contrat signé !",
        `Le contrat ${contract.type} pour le bien ${contract.property.reference} a été signé.`,
        `/properties/${contract.propertyId}`
      );
    }
  }

  // HelloSign exige cet accusé de réception exact
  return NextResponse.json({ hello: "world" });
}
