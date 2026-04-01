/**
 * GET /api/admin/properties
 * Liste tous les biens avec filtres par statut admin — admin uniquement.
 * Query : ?adminStatus=PENDING&q=texte_recherche
 */
import { NextRequest, NextResponse }       from "next/server";
import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import type { AdminStatus, Prisma }       from "@prisma/client";

const VALID_STATUSES: string[] = ["PENDING", "VALIDATED", "REJECTED"];

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const adminStatus = searchParams.get("adminStatus") ?? "";
  const q           = searchParams.get("q")           ?? "";

  const where: Prisma.PropertyWhereInput = {};

  if (adminStatus && VALID_STATUSES.includes(adminStatus)) {
    where.adminStatus = adminStatus as AdminStatus;
  }

  if (q) {
    where.OR = [
      { reference:  { contains: q, mode: "insensitive" } },
      { city:       { contains: q, mode: "insensitive" } },
      { ownerName:  { contains: q, mode: "insensitive" } },
      { ownerPhone: { contains: q, mode: "insensitive" } },
    ];
  }

  const [properties, statusCounts] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { declaredAt: "desc" },
      take: 150,
      select: {
        id: true, reference: true, propertyType: true,
        city: true, neighborhood: true,
        estimatedPrice: true, ownerPhone: true,
        pipelineStage: true, adminStatus: true,
        isPriority: true, isDuplicate: true,
        declaredAt: true, updatedAt: true,
        declaredBy: { select: { firstName: true, lastName: true } },
        agency:     { select: { name: true } },
      },
    }),
    prisma.property.groupBy({
      by:     ["adminStatus"],
      _count: { id: true },
    }),
  ]);

  const counts: Record<string, number> = {};
  for (const g of statusCounts) counts[g.adminStatus] = g._count.id;

  return NextResponse.json({ properties, counts });
}
