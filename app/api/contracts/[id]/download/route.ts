/**
 * GET /api/contracts/[id]/download
 * Télécharge le PDF signé depuis HelloSign.
 * Disponible uniquement si le contrat est au statut SIGNED.
 */

import { NextRequest, NextResponse }       from "next/server";
import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import { downloadSignedDocument }          from "@/lib/services/hellosign.service";

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
      id:                 true,
      status:             true,
      hellosignRequestId: true,
      userId:             true,
      property:           { select: { reference: true, declaredById: true } },
    },
  });

  if (!contract) return NextResponse.json({ error: "Contrat introuvable" }, { status: 404 });

  // Vérifier accès
  const hasAccess =
    payload.role === "ADMIN" ||
    contract.userId === payload.userId ||
    contract.property.declaredById === payload.userId;
  if (!hasAccess) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  if (contract.status !== "SIGNED" || !contract.hellosignRequestId)
    return NextResponse.json({ error: "Document non disponible — contrat non signé" }, { status: 404 });

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await downloadSignedDocument(contract.hellosignRequestId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur HelloSign";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const filename = `contrat-${contract.property.reference}-${params.id}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length":      String(pdfBuffer.length),
    },
  });
}
