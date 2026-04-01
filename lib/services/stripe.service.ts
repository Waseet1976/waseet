/**
 * stripe.service.ts
 * Intégration Stripe — gestion des abonnements agences.
 * Utilise stripe@^20 (déjà installé).
 */

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquant");
  return new Stripe(key, { apiVersion: "2026-02-25.clover" as Stripe.LatestApiVersion });
}

// ── Types locaux ──────────────────────────────────────────────────────────────

interface AgencyData {
  id:    string;
  name:  string;
  email: string;
}

export interface SubscriptionInfo {
  status:           string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  planId:           string | null;
  subscriptionId:   string | null;
}

// ── Fonctions publiques ───────────────────────────────────────────────────────

/**
 * Crée un customer Stripe pour une agence et persiste le stripeCustomerId.
 */
export async function createCustomer(agency: AgencyData): Promise<string> {
  const stripe   = getStripe();
  const customer = await stripe.customers.create({
    email:    agency.email,
    name:     agency.name,
    metadata: { waseet_agency_id: agency.id },
  });

  await prisma.agency.update({
    where: { id: agency.id },
    data:  { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Crée un abonnement Stripe pour une agence.
 * Si l'agence n'a pas encore de stripeCustomerId, en crée un à la volée.
 */
export async function createSubscription(
  agencyId: string,
  priceId:  string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  const agency = await prisma.agency.findUnique({
    where:  { id: agencyId },
    select: { id: true, name: true, email: true, stripeCustomerId: true },
  });
  if (!agency) throw new Error("Agence introuvable");

  let customerId = agency.stripeCustomerId;
  if (!customerId) {
    customerId = await createCustomer({
      id:    agency.id,
      name:  agency.name,
      email: agency.email,
    });
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items:    [{ price: priceId }],
    metadata: { waseet_agency_id: agencyId },
    expand:   ["latest_invoice.payment_intent"],
  });

  // Activer l'agence dès la création (le webhook confirmera)
  if (subscription.status === "active" || subscription.status === "trialing") {
    await prisma.agency.update({
      where: { id: agencyId },
      data:  { isActive: true },
    });
  }

  return subscription;
}

/**
 * Annule l'abonnement actif d'une agence (fin de période en cours).
 */
export async function cancelSubscription(agencyId: string): Promise<void> {
  const stripe = getStripe();

  const agency = await prisma.agency.findUnique({
    where:  { id: agencyId },
    select: { stripeCustomerId: true },
  });
  if (!agency?.stripeCustomerId) throw new Error("Pas de customer Stripe pour cette agence");

  // Récupère les abonnements actifs du customer
  const subs = await stripe.subscriptions.list({
    customer: agency.stripeCustomerId,
    status:   "active",
    limit:    1,
  });

  if (subs.data.length === 0) throw new Error("Aucun abonnement actif");

  // Annulation en fin de période (pas immédiatement)
  await stripe.subscriptions.update(subs.data[0]!.id, {
    cancel_at_period_end: true,
  });
}

/**
 * Récupère le statut d'abonnement d'une agence.
 */
export async function getSubscriptionStatus(agencyId: string): Promise<SubscriptionInfo> {
  const stripe = getStripe();

  const agency = await prisma.agency.findUnique({
    where:  { id: agencyId },
    select: { stripeCustomerId: true },
  });

  if (!agency?.stripeCustomerId) {
    return {
      status:            "no_subscription",
      currentPeriodEnd:  null,
      cancelAtPeriodEnd: false,
      planId:            null,
      subscriptionId:    null,
    };
  }

  const subs = await stripe.subscriptions.list({
    customer: agency.stripeCustomerId,
    limit:    1,
    expand:   ["data.items"],
  });

  if (subs.data.length === 0) {
    return {
      status:            "no_subscription",
      currentPeriodEnd:  null,
      cancelAtPeriodEnd: false,
      planId:            null,
      subscriptionId:    null,
    };
  }

  const sub   = subs.data[0]!;
  const price = sub.items.data[0]?.price;

  return {
    status:            sub.status,
    currentPeriodEnd:  (sub as unknown as { current_period_end?: number }).current_period_end
      ? new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000)
      : null,
    cancelAtPeriodEnd: (sub as unknown as { cancel_at_period_end?: boolean }).cancel_at_period_end ?? false,
    planId:            price?.id ?? null,
    subscriptionId:    sub.id,
  };
}

/**
 * Crée une session Stripe Billing Portal pour qu'une agence gère son abonnement.
 */
export async function createBillingPortalSession(
  agencyId:  string,
  returnUrl: string
): Promise<string> {
  const stripe = getStripe();

  const agency = await prisma.agency.findUnique({
    where:  { id: agencyId },
    select: { stripeCustomerId: true },
  });
  if (!agency?.stripeCustomerId) throw new Error("Pas de customer Stripe");

  const session = await stripe.billingPortal.sessions.create({
    customer:   agency.stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}
