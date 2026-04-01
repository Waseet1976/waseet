/**
 * POST /api/admin/validate-property
 * Body : { propertyId, action: "validate" | "reject" | "confirm_duplicate" | "deny_duplicate", note? }
 * Réservé aux ADMIN.
 */

import { NextRequest, NextResponse } from "next/server";
import { z }                          from "zod";
import { prisma }                     from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";

const bodySchema = z.object({
  propertyId: z.string().min(1),
  action:     z.enum(["validate", "reject", "confirm_duplicate", "deny_duplicate"]),
  note:       z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const result = bodySchema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Données invalides", field: issue?.path[0] },
      { status: 422 }
    );
  }

  const { propertyId, action, note } = result.data;

  const property = await prisma.property.findUnique({
    where:  { id: propertyId },
    select: { id: true, adminStatus: true, isDuplicate: true, pipelineStage: true, declaredById: true },
  });
  if (!property) return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });

  switch (action) {
    case "validate": {
      // Valider le bien → adminStatus=VALIDATED, pipeline passe à VALIDATED si encore DECLARED
      const updated = await prisma.property.update({
        where: { id: propertyId },
        data:  {
          adminStatus:   "VALIDATED",
          internalNotes: note,
          // Avancer le pipeline si encore au début
          ...(property.pipelineStage === "DECLARED"
            ? { pipelineStage: "VALIDATED" }
            : {}),
        },
      });

      // Log pipeline si avancé
      if (property.pipelineStage === "DECLARED") {
        await prisma.pipelineLog.create({
          data: {
            propertyId,
            stage:       "VALIDATED",
            changedById: payload.userId,
            note:        note ?? "Validé par l'administrateur",
          },
        });
      }

      // Notification au déclarant
      await prisma.notification.create({
        data: {
          userId:  property.declaredById,
          type:    "PROPERTY_VALIDATED",
          title:   "Bien validé",
          message: "Votre déclaration a été validée par l'administrateur.",
          link:    `/properties/${propertyId}`,
        },
      });

      return NextResponse.json({ success: true, property: updated });
    }

    case "reject": {
      const updated = await prisma.property.update({
        where: { id: propertyId },
        data:  { adminStatus: "REJECTED", internalNotes: note },
      });

      await prisma.notification.create({
        data: {
          userId:  property.declaredById,
          type:    "PROPERTY_REJECTED",
          title:   "Bien refusé",
          message: note ?? "Votre déclaration n'a pas été retenue.",
          link:    `/properties/${propertyId}`,
        },
      });

      return NextResponse.json({ success: true, property: updated });
    }

    case "confirm_duplicate": {
      // Confirmer le doublon → garder isDuplicate=true, rejeter
      const updated = await prisma.property.update({
        where: { id: propertyId },
        data:  {
          adminStatus:   "REJECTED",
          isDuplicate:   true,
          internalNotes: note ?? "Doublon confirmé par l'administrateur",
        },
      });

      await prisma.notification.create({
        data: {
          userId:  property.declaredById,
          type:    "PROPERTY_REJECTED",
          title:   "Déclaration doublon",
          message: "Ce bien existe déjà dans notre base de données.",
          link:    `/properties/${propertyId}`,
        },
      });

      return NextResponse.json({ success: true, property: updated });
    }

    case "deny_duplicate": {
      // Infirmer le doublon → effacer le flag, valider
      const updated = await prisma.property.update({
        where: { id: propertyId },
        data:  {
          adminStatus:   "VALIDATED",
          isDuplicate:   false,
          duplicateKey:  null,
          internalNotes: note ?? "Doublon infirmé par l'administrateur",
          ...(property.pipelineStage === "DECLARED"
            ? { pipelineStage: "VALIDATED" }
            : {}),
        },
      });

      if (property.pipelineStage === "DECLARED") {
        await prisma.pipelineLog.create({
          data: {
            propertyId,
            stage:       "VALIDATED",
            changedById: payload.userId,
            note:        "Doublon infirmé et bien validé",
          },
        });
      }

      await prisma.notification.create({
        data: {
          userId:  property.declaredById,
          type:    "PROPERTY_VALIDATED",
          title:   "Bien validé",
          message: "Votre déclaration a été vérifiée et validée.",
          link:    `/properties/${propertyId}`,
        },
      });

      return NextResponse.json({ success: true, property: updated });
    }
  }
}
