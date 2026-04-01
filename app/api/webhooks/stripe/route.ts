import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        // Marque l'agence comme active via son stripeCustomerId
        await prisma.agency.updateMany({
          where:  { stripeCustomerId: sub.customer as string },
          data:   { isActive: sub.status === "active" },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.agency.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data:  { isActive: false },
        });
        break;
      }

      case "invoice.paid": {
        // Paiement confirmé → s'assurer que l'agence est active
        const invoice = event.data.object as Stripe.Invoice;
        await prisma.agency.updateMany({
          where: { stripeCustomerId: invoice.customer as string },
          data:  { isActive: true },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await prisma.agency.updateMany({
          where: { stripeCustomerId: invoice.customer as string },
          data:  { isActive: false },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
