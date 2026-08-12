import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured.");
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripeClient;
}

export type PlanId = "solo" | "team";
export type BillingInterval = "monthly" | "yearly";

export const PLAN_LABELS: Record<PlanId, string> = {
  solo: "Solo",
  team: "Team",
};

export function priceIdFor(plan: PlanId, interval: BillingInterval): string {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`;
  const priceId = process.env[key];
  if (!priceId) {
    throw new Error(`Missing env var ${key} for Stripe price lookup.`);
  }
  return priceId;
}
