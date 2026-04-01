/**
 * GET /api/contracts/[id]/status
 * Récupère le statut HelloSign d'un contrat et le met à jour si complet.
 */

import { NextRequest, NextResponse }       from "next/server";
import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import { getSignatureStatus }              from "@/lib/services/hellosign.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const contract = await prisma.contract.findUnique({
    where:  { id: params.id },
    select: {
      id:                  true,
      status:              true,
      hellosignRequestId:  true,
      userId:              true,
      property:            { select: { declaredById: true } },
    },
  });

  if (!contract) return NextResponse.json({ error: "Contrat introuvable" }, { status: 404 });

  // Vérifier accès : propriétaire du contrat, déclarant du bien, ou ADMIN
  const hasAccess =
    payload.role === "ADMIN" ||
    contract.userId === payload.userId ||
    contract.property.declaredById === payload.userId;
  if (!hasAccess) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  if (!contract.hellosignRequestId)
    return NextResponse.json({ error: "Pas de demande de signature pour ce contrat" }, { status: 404 });

  let status;
  try {
    status = await getSignatureStatus(contract.hellosignRequestId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur HelloSign";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // Mise à jour automatique si tous ont signé
  if (status.isComplete && contract.status !== "SIGNED") {
    await prisma.contract.update({
      where: { id: params.id },
      data:  { status: "SIGNED", signedAt: new Date() },
    });
  }

  return NextResponse.json(status);
}
