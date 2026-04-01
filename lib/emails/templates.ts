/**
 * lib/emails/templates.ts
 * Helpers pour construire les options SendGrid de chaque email transactionnel.
 * Chaque fonction retourne un objet prêt pour sendEmail().
 *
 * Les IDs de templates SendGrid Dynamic sont lus depuis les variables d'env.
 * En développement (variable absente) la fonction retourne quand même un objet
 * valide — sendEmail() sera silencieux si SENDGRID_API_KEY manque.
 */

import type { SendEmailOptions } from "@/lib/services/notification.service";
import { APP_NAME, APP_URL, BONUS_REFERRAL_AMOUNT } from "@/lib/config";

// ── IDs templates (à créer sur sendgrid.com) ──────────────────────────────────
const T = {
  WELCOME:          process.env.SENDGRID_TEMPLATE_WELCOME          ?? "d-welcome",
  PROPERTY_VALIDATED: process.env.SENDGRID_TEMPLATE_PROP_VALIDATED ?? "d-property-validated",
  COMMISSION_PAID:  process.env.SENDGRID_TEMPLATE_COMMISSION_PAID  ?? "d-commission-paid",
  REFERRAL_BONUS:   process.env.SENDGRID_TEMPLATE_REFERRAL_BONUS   ?? "d-referral-bonus",
  NEW_REFERRAL:     process.env.SENDGRID_TEMPLATE_NEW_REFERRAL     ?? "d-new-referral",
} as const;

// ── Template : Bienvenue ───────────────────────────────────────────────────────

export function welcomeEmail(params: {
  to:        string;
  firstName: string;
  role:      string;
  referralCode?: string;
}): SendEmailOptions {
  return {
    to:         params.to,
    subject:    `Bienvenue sur ${APP_NAME} 🎉`,
    templateId: T.WELCOME,
    data: {
      app_name:    APP_NAME,
      first_name:  params.firstName,
      role_label:  params.role,
      login_url:   `${APP_URL}/login`,
      referral_code: params.referralCode ?? null,
      referral_url:  params.referralCode
        ? `${APP_URL}/signup?ref=${params.referralCode}`
        : null,
    },
  };
}

// ── Template : Bien validé ────────────────────────────────────────────────────

export function propertyValidatedEmail(params: {
  to:          string;
  firstName:   string;
  reference:   string;
  propertyId:  string;
  city?:       string;
}): SendEmailOptions {
  return {
    to:         params.to,
    subject:    `Votre bien ${params.reference} a été validé`,
    templateId: T.PROPERTY_VALIDATED,
    data: {
      app_name:   APP_NAME,
      first_name: params.firstName,
      reference:  params.reference,
      city:       params.city ?? "",
      property_url: `${APP_URL}/properties/${params.propertyId}`,
      pipeline_url: `${APP_URL}/pipeline`,
    },
  };
}

// ── Template : Commission payée ───────────────────────────────────────────────

export function commissionPaidEmail(params: {
  to:          string;
  firstName:   string;
  amount:      number;
  currency:    string;
  reference:   string;
  propertyId:  string;
  paidAt:      Date;
}): SendEmailOptions {
  return {
    to:         params.to,
    subject:    `Votre commission de ${params.amount.toLocaleString("fr-FR")} ${params.currency} a été versée`,
    templateId: T.COMMISSION_PAID,
    data: {
      app_name:       APP_NAME,
      first_name:     params.firstName,
      amount:         params.amount.toLocaleString("fr-FR"),
      currency:       params.currency,
      reference:      params.reference,
      paid_at:        params.paidAt.toLocaleDateString("fr-FR", {
        day: "2-digit", month: "long", year: "numeric",
      }),
      commissions_url: `${APP_URL}/commissions`,
      property_url:    `${APP_URL}/properties/${params.propertyId}`,
    },
  };
}

// ── Template : Bonus parrainage reçu ─────────────────────────────────────────

export function referralBonusEmail(params: {
  to:           string;
  firstName:    string;
  referredName: string;
  amount:       number;
  currency:     string;
}): SendEmailOptions {
  return {
    to:         params.to,
    subject:    `Vous recevez un bonus parrainage de ${params.amount.toLocaleString("fr-FR")} ${params.currency}`,
    templateId: T.REFERRAL_BONUS,
    data: {
      app_name:      APP_NAME,
      first_name:    params.firstName,
      referred_name: params.referredName,
      amount:        params.amount.toLocaleString("fr-FR"),
      currency:      params.currency,
      bonus_default: BONUS_REFERRAL_AMOUNT.toLocaleString("fr-FR"),
      referral_url:  `${APP_URL}/referral`,
    },
  };
}

// ── Template : Nouveau filleul ────────────────────────────────────────────────

export function newReferralEmail(params: {
  to:           string;
  firstName:    string;
  referredName: string;
  referredEmail: string;
}): SendEmailOptions {
  const currency = "€";
  return {
    to:         params.to,
    subject:    `${params.referredName} vient de rejoindre Waseet grâce à vous !`,
    templateId: T.NEW_REFERRAL,
    data: {
      app_name:       APP_NAME,
      first_name:     params.firstName,
      referred_name:  params.referredName,
      referred_email: params.referredEmail,
      bonus_amount:   BONUS_REFERRAL_AMOUNT.toLocaleString("fr-FR"),
      currency,
      referral_url:   `${APP_URL}/referral`,
    },
  };
}
