/**
 * POST /api/webhooks/twilio
 * Reçoit les callbacks Twilio pour SMS et WhatsApp :
 *  - MessageStatus : statut de livraison (sent, delivered, failed, undelivered…)
 *  - Incoming Body : message entrant de l'utilisateur (ex : STOP, réponse)
 *
 * Twilio signe chaque requête via X-Twilio-Signature.
 * Vérification optionnelle si TWILIO_AUTH_TOKEN est configuré.
 *
 * Réponse : TwiML vide — indique à Twilio qu'on ne veut pas envoyer de réponse automatique.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto                        from "crypto";

// ── Vérification de signature Twilio ──────────────────────────────────────────

function verifyTwilioSignature(
  authToken:    string,
  twilioSig:    string,
  url:          string,
  params:       Record<string, string>
): boolean {
  // Reconstruct the string to sign : URL + sorted params concatenated
  const sortedKeys = Object.keys(params).sort();
  const str        = sortedKeys.reduce((acc, key) => acc + key + params[key], url);
  const expected   = crypto
    .createHmac("sha1", authToken)
    .update(str)
    .digest("base64");
  return expected === twilioSig;
}

// ── TwiML réponse vide ────────────────────────────────────────────────────────

function twimlEmpty(): NextResponse {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    {
      status:  200,
      headers: { "Content-Type": "text/xml" },
    }
  );
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Lire le corps form-data
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return twimlEmpty();
  }

  // Convertir en Record pour la vérification de signature
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === "string") params[key] = value;
  });

  // Vérification optionnelle de la signature Twilio
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioSig = req.headers.get("x-twilio-signature") ?? "";

  if (authToken && twilioSig) {
    const url    = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/webhooks/twilio`;
    const valid  = verifyTwilioSignature(authToken, twilioSig, url, params);
    if (!valid) {
      console.warn("[webhook/twilio] Signature invalide — requête ignorée");
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const msgStatus = params["MessageStatus"];
  const from      = params["From"];
  const body      = params["Body"];
  const to        = params["To"];
  const msgSid    = params["MessageSid"];

  // ── Statut de livraison ────────────────────────────────────────────────────
  if (msgStatus) {
    if (msgStatus === "failed" || msgStatus === "undelivered") {
      console.warn(
        `[webhook/twilio] Message non livré — SID=${msgSid} To=${to} Status=${msgStatus}`
      );
      // Extension possible : logger en base ou alerter l'admin
    } else {
      console.log(`[webhook/twilio] Status=${msgStatus} SID=${msgSid}`);
    }
  }

  // ── Message entrant ────────────────────────────────────────────────────────
  if (from && body) {
    const normalized = body.trim().toUpperCase();
    console.log(`[webhook/twilio] Message entrant depuis ${from}: ${body}`);

    // Commande STOP — désactivation des notifications SMS/WhatsApp
    // Twilio gère STOP automatiquement, mais on peut logger ici
    if (normalized === "STOP" || normalized === "ARRET") {
      console.log(`[webhook/twilio] Opt-out reçu de ${from}`);
    }
  }

  return twimlEmpty();
}
