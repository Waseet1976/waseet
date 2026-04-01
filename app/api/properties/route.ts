import { NextRequest, NextResponse } from "next/server";
import type { Prisma, PipelineStage } from "@prisma/client";

import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import { declarePropertySchema }           from "@/lib/validations/property";
import { createOpportunity }              from "@/lib/services/ghl.service";

// ── GET /api/properties ───────────────────────────────────────────────────────
// Liste les biens selon le rôle de l'utilisateur.
// Query params : stage, type, city, priority (true|false), q (search)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const stage       = searchParams.get("stage")       ?? "";
  const type        = searchParams.get("type")        ?? "";
  const city        = searchParams.get("city")        ?? "";
  const priority    = searchParams.get("priority")    ?? "";
  const q           = searchParams.get("q")           ?? "";
  const adminStatus = searchParams.get("adminStatus") ?? "";
  const limit       = parseInt(searchParams.get("limit") ?? "100", 10);

  // Filtre de base selon le rôle
  const where: Prisma.PropertyWhereInput = {};

  if (payload.role === "DEAL_FINDER") {
    where.declaredById = payload.userId;
  } else if (payload.role === "AGENT") {
    const agentProfile = await prisma.agent.findUnique({
      where: { userId: payload.userId }, select: { id: true },
    });
    if (!agentProfile) return NextResponse.json({ properties: [] });
    where.assignedAgentId = agentProfile.id;
  }
  // ADMIN / AGENCY → voient tout

  // Filtres additionnels
  const VALID_STAGES = [
    "DECLARED","VALIDATED","IN_REVIEW","MANDATE_SIGNED",
    "COMPROMISE_SIGNED","DEED_SIGNED","COMMISSION_VALIDATED","COMMISSION_PAID",
  ];
  if (stage && VALID_STAGES.includes(stage)) where.pipelineStage = stage as PipelineStage;
  if (type) where.propertyType = type;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (priority === "true")  where.isPriority = true;
  if (priority === "false") where.isPriority = false;

  if (q) {
    where.OR = [
      { reference:  { contains: q, mode: "insensitive" } },
      { city:       { contains: q, mode: "insensitive" } },
      { address:    { contains: q, mode: "insensitive" } },
      { ownerName:  { contains: q, mode: "insensitive" } },
      { neighborhood:{ contains: q, mode: "insensitive" } },
    ];
  }

  const VALID_STATUSES = ["PENDING", "VALIDATED", "REJECTED"];
  if (adminStatus && VALID_STATUSES.includes(adminStatus)) {
    where.adminStatus = adminStatus as "PENDING" | "VALIDATED" | "REJECTED";
  }

  const properties = await prisma.property.findMany({
    where,
    orderBy: { declaredAt: "desc" },
    take: isNaN(limit) || limit <= 0 ? 100 : limit,
    select: {
      id: true, reference: true, country: true,
      city: true, neighborhood: true, address: true,
      propertyType: true, surfaceSqm: true, estimatedPrice: true,
      pipelineStage: true, adminStatus: true,
      isPriority: true, isDuplicate: true,
      declaredAt: true, latitude: true, longitude: true,
      photos: true,
    },
  });

  return NextResponse.json({ properties });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Normalise une chaîne pour la clé de dédoublonnage */
function norm(s: string | null | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\-().+]/g, "");
}

/**
 * Clé de dédoublonnage basée sur ville + quartier + téléphone propriétaire.
 * Détecte le MÊME bien déclaré plusieurs fois par des apporteurs différents.
 */
function buildDeclareKey(
  city: string,
  neighborhood: string | undefined,
  ownerPhone: string
): string {
  return [norm(city), norm(neighborhood) || "x", norm(ownerPhone)].join("|");
}

/** Génère une référence de bien au format WST-YYYY-XXXX */
function generateReference(): string {
  const year  = new Date().getFullYear().toString();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix  = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WST-${year}-${suffix}`;
}

// ── POST /api/properties ──────────────────────────────────────────────────────
// Déclare un nouveau bien immobilier.
// Règles métier appliquées :
//   - declaredAt    = new Date() côté serveur (Prisma @default(now()))
//   - duplicateKey  = buildDeclareKey(city, neighborhood, ownerPhone)
//   - isPriority    = true si premier déclarant pour ce duplicateKey
//   - isDuplicate   = true si ≥ 1 déclaration similaire existe déjà
//   - reference     = WST-YYYY-XXXX (unique, généré ici)
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {

  // 1. Auth ──────────────────────────────────────────────────────────────────
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 401 });
  }

  // 2. Parse & validation ────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const result = declarePropertySchema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Données invalides", field: issue?.path[0] },
      { status: 422 }
    );
  }
  const data = result.data;

  // 3. Détection de doublons ─────────────────────────────────────────────────
  const duplicateKey = buildDeclareKey(data.city, data.neighborhood, data.ownerPhone);

  const existingCount = await prisma.property.count({
    where: { duplicateKey },
  });

  const isPriority  = existingCount === 0;
  const isDuplicate = existingCount > 0;

  // 4. Référence unique ──────────────────────────────────────────────────────
  let reference = generateReference();
  // Garantit l'unicité en cas (très rare) de collision
  const refExists = await prisma.property.findUnique({ where: { reference } });
  if (refExists) reference = generateReference();

  // 5. Création du bien ──────────────────────────────────────────────────────
  const property = await prisma.property.create({
    data: {
      reference,
      country:        data.country,
      city:           data.city,
      neighborhood:   data.neighborhood  ?? null,
      address:        data.address       ?? null,
      postalCode:     data.postalCode    ?? null,
      latitude:       data.latitude      ?? null,
      longitude:      data.longitude     ?? null,
      propertyType:   data.propertyType,
      surfaceSqm:     data.surfaceSqm,
      estimatedPrice: data.estimatedPrice,
      roomsCount:     data.roomsCount    ?? null,
      description:    data.description   ?? null,
      ownerName:      data.ownerName,
      ownerPhone:     data.ownerPhone,
      ownerEmail:     data.ownerEmail    || null,
      agencyId:       data.agencyId      || null,
      photos:         data.photos        ?? [],
      internalNotes:  data.internalNotes ?? null,
      declaredById:   payload.userId,
      // declaredAt → @default(now()) dans Prisma — toujours côté serveur
      duplicateKey,
      isDuplicate,
      isPriority,
      pipelineStage:  "DECLARED",
      adminStatus:    "PENDING",
    },
  });

  // 6. Log pipeline ──────────────────────────────────────────────────────────
  await prisma.pipelineLog.create({
    data: {
      propertyId:  property.id,
      stage:       "DECLARED",
      changedById: payload.userId,
      note:        `Bien déclaré — réf. ${reference}`,
    },
  });

  // 7. Notification apporteur ────────────────────────────────────────────────
  await prisma.notification.create({
    data: {
      userId:  payload.userId,
      type:    "PROPERTY_DECLARED",
      title:   isPriority
        ? "Bien déclaré — Priorité accordée !"
        : "Bien déclaré avec succès",
      message: isPriority
        ? `Réf. ${reference} — Vous êtes le premier déclarant à ${data.city}. Priorité assurée sur cette opportunité.`
        : `Réf. ${reference} — Bien enregistré à ${data.city}. ${existingCount} déclaration(s) similaire(s) existent. Le premier déclarant reste prioritaire.`,
      link:    "/my-properties",
    },
  });

  // 8. GHL — créer une opportunité (fire-and-forget) ────────────────────────
  createOpportunity({
    id:             property.id,
    reference:      property.reference,
    city:           data.city ?? null,
    neighborhood:   data.neighborhood ?? null,
    country:        data.country ?? null,
    estimatedPrice: data.estimatedPrice ?? null,
    propertyType:   data.propertyType ?? null,
    pipelineStage:  "DECLARED",
  }).then(async (opportunityId) => {
    if (opportunityId) {
      await prisma.property.update({
        where: { id: property.id },
        data:  { ghlOpportunityId: opportunityId },
      });
    }
  }).catch(() => {});

  // 9. Notifications admin ───────────────────────────────────────────────────
  const admins = await prisma.user.findMany({
    where:  { role: "ADMIN", isActive: true },
    select: { id: true },
  });

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId:  admin.id,
        type:    "ADMIN_NEW_PROPERTY",
        title:   `Nouveau bien déclaré — ${data.city}`,
        message: `Réf. ${reference} — ${data.propertyType} ${data.surfaceSqm}m² à ${data.city}. Statut : En attente de validation.`,
        link:    `/admin/properties/${property.id}`,
      })),
    });
  }

  return NextResponse.json(
    {
      property,
      reference,
      isPriority,
      isDuplicate,
      existingCount,
      declaredAt: property.declaredAt,
    },
    { status: 201 }
  );
}
