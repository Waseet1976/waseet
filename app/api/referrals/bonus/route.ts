/**
 * POST /api/referrals/bonus
 * Attribution manuelle du bonus de parrainage (ADMIN seulement).
 * Body : { propertyId }
 *
 * En temps normal, le bonus est déclenché automatiquement par
 * app/api/commissions/[id]/route.ts → payCommission().
 * Cette route permet à l'admin de le déclencher manuellement si nécessaire.
 */

import { NextRequest, NextResponse } from "next/server";

import { prisma }                          from "@/lib/prisma";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import { checkAndAttributeBonus }          from "@/lib/services/referral-bonus.service";
import { BONUS_REFERRAL_AMOUNT }           from "@/lib/config";

export async function POST(req: NextRequest) {
  // 1. Auth ──────────────────────────────────────────────────────────────────
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  if (payload.role !== "ADMIN") {
    return NextResponse.json({ error: "Réservé à l'administrateur" }, { status: 403 });
  }

  // 2. Body ──────────────────────────────────────────────────────────────────
  let body: { propertyId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const { propertyId } = body;
  if (!propertyId) {
    return NextResponse.json({ error: "propertyId requis" }, { status: 422 });
  }

  // 3. Vérifier que le bien existe
  const property = await prisma.property.findUnique({
    where:   { id: propertyId },
    include: {
      declaredBy: {
        select: { id: true, firstName: true, lastName: true, referredById: true },
      },
    },
  });
  if (!property) {
    return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });
  }

  // 4. Vérifier qu'il y a un parrain
  if (!property.declaredBy.referredById) {
    return NextResponse.json(
      {
        error:   "Cet apporteur n'a pas de parrain",
        applied: false,
      },
      { status: 200 }
    );
  }

  // 5. Attribuer le bonus (idempotent via bonusPaid check dans le service)
  const result = await checkAndAttributeBonus(propertyId);

  if (!result) {
    return NextResponse.json(
      {
        message: "Bonus déjà attribué ou parrain introuvable",
        applied: false,
      },
      { status: 200 }
    );
  }

  // 6. Email SendGrid au parrain (si configuré)
  const parrain = await prisma.user.findUnique({
    where:  { id: property.declaredBy.referredById },
    select: { email: true, firstName: true },
  });

  if (parrain) {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      const currency = result.currency;
      const html = `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;padding:24px">
          <div style="background:#1C1C1A;border-radius:12px;padding:24px;text-align:center;margin-bottom:20px">
            <h1 style="color:#C9973A;margin:0;font-size:22px">Waseet</h1>
            <p style="color:rgba(255,255,255,.5);margin:4px 0 0;font-size:12px">Plateforme immobilière</p>
          </div>
          <p style="font-size:15px">Bonjour ${parrain.firstName},</p>
          <div style="background:#F5F0E8;border-left:4px solid #C9973A;border-radius:8px;padding:16px;margin:16px 0">
            <p style="font-weight:700;font-size:18px;color:#1C1C1A;margin:0 0 6px">
              🎁 Bonus parrainage : ${result.amount.toLocaleString("fr-FR")} ${currency}
            </p>
            <p style="font-size:13px;color:#6B7280;margin:0">
              Votre filleul ${property.declaredBy.firstName} ${property.declaredBy.lastName} a conclu une vente.
            </p>
          </div>
          <p style="font-size:13px;color:#3C3C3A">
            Ce bonus est crédité sur votre compte Waseet. Continuez à parrainer et multipliez vos gains !
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/referrals"
             style="display:inline-block;background:#C9973A;color:#fff;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px">
            Voir mon réseau →
          </a>
        </div>
      `;

      await fetch("https://api.sendgrid.com/v3/mail/send", {
        method:  "POST",
        headers: {
          Authorization:  `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: parrain.email }] }],
          from:    { email: "noreply@waseet.com", name: "Waseet" },
          subject: `Waseet – Bonus parrainage ${result.amount} ${currency} débloqué !`,
          content: [{ type: "text/html", value: html }],
        }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({
    applied:     true,
    referralId:  result.referralId,
    amount:      result.amount,
    currency:    result.currency,
    bonusAmount: BONUS_REFERRAL_AMOUNT,
    parrain:     parrain ? { email: parrain.email, firstName: parrain.firstName } : null,
  });
}
