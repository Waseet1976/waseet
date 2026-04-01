/**
 * POST /api/contracts/[id]/send
 * Envoie le contrat vers HelloSign pour signature électronique.
 * Réservé aux ADMIN / AGENCY.
 */

import { NextRequest, NextResponse }       from "next/server";
import { z }                               from "zod";
import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import { sendForSignature }                from "@/lib/services/hellosign.service";
import { createNotification }              from "@/lib/services/notification.service";
import type { HelloSignContractType }      from "@/lib/services/hellosign.service";

const bodySchema = z.object({
  signers: z.array(z.object({
    name:  z.string().min(1),
    email: z.string().email(),
    role:  z.string().min(1),
  })).min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  if (payload.role !== "ADMIN" && payload.role !== "AGENCY")
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });

  const contract = await prisma.contract.findUnique({
    where:   { id: params.id },
    include: {
      property: {
        include: {
          declaredBy: { select: { id: true, email: true } },
          agency:     { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!contract)
    return NextResponse.json({ error: "Contrat introuvable" }, { status: 404 });

  if (contract.status !== "DRAFT")
    return NextResponse.json({ error: "Ce contrat a déjà été envoyé" }, { status: 409 });

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

  const { signers } = result.data;
  const property    = contract.property;

  let signatureResult;
  try {
    signatureResult = await sendForSignature({
      contractId:        contract.id,
      propertyId:        contract.propertyId,
      signers,
      contractType:      contract.type as HelloSignContractType,
      propertyReference: property.reference,
      propertyAddress:   [property.neighborhood, property.city].filter(Boolean).join(", "),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur HelloSign";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // Mettre à jour le contrat
  await prisma.contract.update({
    where: { id: params.id },
    data:  { status: "SENT", hellosignRequestId: signatureResult.signatureRequestId },
  });

  // Notifier chaque signataire qui a un compte Waseet
  await Promise.all(
    signers.map(async (signer) => {
      const signerUser = await prisma.user.findUnique({
        where:  { email: signer.email },
        select: { id: true },
      });
      if (signerUser) {
        await createNotification(
          signerUser.id,
          "CONTRACT_SENT",
          "Contrat à signer",
          `Vous avez un contrat en attente de signature pour le bien ${property.reference}.`,
          `/contracts`
        );
      }
    })
  );

  return NextResponse.json({
    success:            true,
    signatureRequestId: signatureResult.signatureRequestId,
    signingUrls:        signatureResult.signingUrls,
  });
}
