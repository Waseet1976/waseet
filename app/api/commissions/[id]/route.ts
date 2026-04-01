/**
 * PATCH /api/commissions/[id]
 * Valider ou marquer comme payée une commission (ADMIN seulement).
 * Body : { action: 'validate' | 'pay', validatedAmount?: number }
 */

import { NextRequest, NextResponse } from "next/server";

import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import {
  validateCommission,
  payCommission,
}                                          from "@/lib/services/commission.service";
import { checkAndAttributeBonus }          from "@/lib/services/referral-bonus.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Auth ──────────────────────────────────────────────────────────────────
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  // 2. Seul l'ADMIN peut valider/payer des commissions
  if (payload.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Réservé à l'administrateur" },
      { status: 403 }
    );
  }

  // 3. Body ──────────────────────────────────────────────────────────────────
  let body: { action?: string; validatedAmount?: number };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const { action, validatedAmount } = body;

  if (!["validate", "pay"].includes(action ?? "")) {
    return NextResponse.json(
      { error: "action doit être 'validate' ou 'pay'" },
      { status: 422 }
    );
  }

  // 4. Vérifier existence ────────────────────────────────────────────────────
  const commission = await prisma.commission.findUnique({
    where: { id: params.id },
  });
  if (!commission) {
    return NextResponse.json({ error: "Commission introuvable" }, { status: 404 });
  }

  // 5. Exécuter l'action ─────────────────────────────────────────────────────
  let updated;
  let bonusResult = null;

  if (action === "validate") {
    if (!validatedAmount || validatedAmount <= 0) {
      return NextResponse.json(
        { error: "validatedAmount requis et > 0" },
        { status: 422 }
      );
    }
    if (commission.status !== "ESTIMATED") {
      return NextResponse.json(
        { error: `Commission déjà ${commission.status === "VALIDATED" ? "validée" : "payée"}` },
        { status: 409 }
      );
    }
    updated = await validateCommission(params.id, validatedAmount);

  } else {
    // action === "pay"
    if (commission.status === "PAID") {
      return NextResponse.json({ error: "Commission déjà payée" }, { status: 409 });
    }
    updated      = await payCommission(params.id);
    bonusResult  = await checkAndAttributeBonus(commission.propertyId);
  }

  return NextResponse.json({ commission: updated, bonusResult });
}
