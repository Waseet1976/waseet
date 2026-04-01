/**
 * notification.service.ts
 * Création de notifications in-app + envoi email (SendGrid) + SMS/WhatsApp (Twilio).
 * Importé uniquement côté serveur (routes API, services).
 */

import { prisma } from "@/lib/prisma";

// ── Types de notifications ─────────────────────────────────────────────────────

export type NotificationType =
  | "PROPERTY_DECLARED"
  | "PROPERTY_VALIDATED"
  | "PROPERTY_REJECTED"
  | "PIPELINE_UPDATED"
  | "COMMISSION_ESTIMATED"
  | "COMMISSION_VALIDATED"
  | "COMMISSION_PAID"
  | "REFERRAL_JOINED"
  | "REFERRAL_BONUS"
  | "DUPLICATE_DETECTED"
  | "CONTRACT_SENT"
  | "CONTRACT_SIGNED";

// ── In-App ─────────────────────────────────────────────────────────────────────

/**
 * Crée une notification persistée en base.
 * Toujours non bloquant en cas d'erreur (log seulement).
 */
export async function createNotification(
  userId:  string,
  type:    NotificationType,
  title:   string,
  message: string,
  link?:   string
): Promise<void> {
  try {
    await prisma.notification.create({
      data: { userId, type, title, message, link },
    });
  } catch (err) {
    console.error("[notification.service] createNotification failed:", err);
  }
}

// ── Email (SendGrid) ───────────────────────────────────────────────────────────

export interface SendEmailOptions {
  to:         string;
  subject:    string;
  templateId: string;
  data:       Record<string, unknown>;
}

/**
 * Envoie un email transactionnel via SendGrid Dynamic Templates.
 * Silencieux si SENDGRID_API_KEY absent (dev / CI).
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn("[notification.service] SENDGRID_API_KEY manquant — email ignoré");
    return;
  }

  const from = process.env.SENDGRID_FROM_EMAIL ?? "noreply@waseet.app";

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:              { email: from, name: "Waseet" },
        personalizations: [
          {
            to:                  [{ email: options.to }],
            dynamic_template_data: options.data,
            subject:             options.subject,
          },
        ],
        template_id: options.templateId,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[notification.service] SendGrid error:", res.status, body);
    }
  } catch (err) {
    console.error("[notification.service] sendEmail failed:", err);
  }
}

// ── SMS (Twilio) ───────────────────────────────────────────────────────────────

/**
 * Envoie un SMS via l'API Twilio REST.
 * Silencieux si variables Twilio absentes.
 */
export async function sendSMS(to: string, message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("[notification.service] Twilio non configuré — SMS ignoré");
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const body = new URLSearchParams({ To: to, From: fromNumber, Body: message });

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: {
        Authorization:  `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[notification.service] Twilio SMS error:", res.status, text);
    }
  } catch (err) {
    console.error("[notification.service] sendSMS failed:", err);
  }
}

// ── WhatsApp (Twilio) ──────────────────────────────────────────────────────────

/**
 * Envoie un message WhatsApp via Twilio (sandbox ou numéro approuvé).
 * Le numéro `to` doit être au format E.164 (ex : +212601234567).
 */
export async function sendWhatsApp(to: string, message: string): Promise<void> {
  const accountSid    = process.env.TWILIO_ACCOUNT_SID;
  const authToken     = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsApp  = process.env.TWILIO_WHATSAPP_NUMBER ?? "whatsapp:+14155238886"; // sandbox Twilio

  if (!accountSid || !authToken) {
    console.warn("[notification.service] Twilio non configuré — WhatsApp ignoré");
    return;
  }

  const url  = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const body = new URLSearchParams({
    To:   `whatsapp:${to}`,
    From: fromWhatsApp,
    Body: message,
  });

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: {
        Authorization:  `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[notification.service] Twilio WhatsApp error:", res.status, text);
    }
  } catch (err) {
    console.error("[notification.service] sendWhatsApp failed:", err);
  }
}

// ── Helpers combinés ──────────────────────────────────────────────────────────

/** Envoie notification in-app + email en parallèle (non bloquant). */
export async function notifyWithEmail(
  userId:  string,
  type:    NotificationType,
  title:   string,
  message: string,
  link:    string | undefined,
  email:   SendEmailOptions
): Promise<void> {
  await Promise.all([
    createNotification(userId, type, title, message, link),
    sendEmail(email),
  ]);
}
