/**
 * GET /api/admin/pipeline
 * Liste tous les biens avec leur étape pipeline — admin uniquement.
 * Query : ?stage=DECLARED&q=texte_recherche
 */

import { NextRequest, NextResponse }       from "next/server";
import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import type { PipelineStage }              from "@prisma/client";

const VALID_STAGES: string[] = [
  "DECLARED", "VALIDATED", "IN_REVIEW", "MANDATE_SIGNED",
  "COMPROMISE_SIGNED", "DEED_SIGNED", "COMMISSION_VALIDATED", "COMMISSION_PAID",
];

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage") ?? "";
  const q     = searchParams.get("q")     ?? "";

  const where: Parameters<typeof prisma.property.findMany>[0]["where"] = {};

  if (stage && VALID_STAGES.includes(stage)) {
    where.pipelineStage = stage as PipelineStage;
  }
  if (q) {
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { city:      { contains: q, mode: "insensitive" } },
      { ownerName: { contains: q, mode: "insensitive" } },
    ];
  }

  const [properties, stageCounts] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 150,
      select: {
        id: true, reference: true, propertyType: true,
        city: true, estimatedPrice: true,
        pipelineStage: true, adminStatus: true,
        isPriority: true, isDuplicate: true,
        declaredAt: true, updatedAt: true,
        declaredBy: { select: { firstName: true, lastName: true } },
        agency:     { select: { name: true } },
      },
    }),
    prisma.property.groupBy({
      by:     ["pipelineStage"],
      _count: { id: true },
    }),
  ]);

  const counts: Record<string, number> = {};
  for (const g of stageCounts) counts[g.pipelineStage] = g._count.id;

  return NextResponse.json({ properties, counts });
}
