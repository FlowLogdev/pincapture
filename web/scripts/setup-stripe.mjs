// One-time setup: creates the PinCapture Stripe products/prices and the
// production webhook endpoint, then writes the resulting IDs into
// web/.env.local. Safe to re-run — it looks up existing objects by
// metadata before creating new ones.
//
// Usage: cd web && node scripts/setup-stripe.mjs
// Requires STRIPE_SECRET_KEY to already be in web/.env.local.

import fs from "node:fs";
import path from "node:path";
import Stripe from "stripe";

const webDir = path.resolve(import.meta.dirname, "..");
const envPath = path.join(webDir, ".env.local");

function loadEnvLocal() {
  if (!fs.existsSync(envPath)) return;
  const preExisting = new Set(Object.keys(process.env));
  const contents = fs.readFileSync(envPath, "utf8");
  for (const line of contents.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.replace(/^"(.*)"$/, "$1");
    // Later lines for the same key win (in case of duplicates from a stale
    // `vercel env pull`), but real shell-exported vars set before this
    // script ran always take precedence over the file.
    if (!preExisting.has(key)) process.env[key] = value;
  }
}

function appendToEnvLocal(entries) {
  const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const existingKeys = new Set(
    [...existing.matchAll(/^([A-Z_][A-Z0-9_]*)=/gm)].map((m) => m[1])
  );
  const lines = Object.entries(entries)
    .filter(([key]) => !existingKeys.has(key))
    .map(([key, value]) => `${key}="${value}"`);
  if (lines.length === 0) return;
  const separator = existing.endsWith("\n") || existing === "" ? "" : "\n";
  fs.appendFileSync(envPath, `${separator}${lines.join("\n")}\n`);
  console.log(`Wrote to ${envPath}:\n  ${lines.map((l) => l.split("=")[0]).join("\n  ")}`);
}

loadEnvLocal();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set in web/.env.local. Add it first.");
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
  console.error(
    "STRIPE_SECRET_KEY in web/.env.local doesn't look like a real Stripe secret key " +
    `(got a value that starts with "${process.env.STRIPE_SECRET_KEY.slice(0, 12)}").`
  );
  console.error(
    "If you ran `vercel env pull` after adding it manually, that overwrote it — " +
    "Vercel's \"Sensitive\" env vars always pull back as a placeholder, never the real value."
  );
  console.error(
    "Fix: copy the real key from https://dashboard.stripe.com/apikeys, paste it into " +
    "web/.env.local yourself, and run this script again WITHOUT running `vercel env pull` in between."
  );
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });

const PLANS = [
  { plan: "solo", name: "PinCapture Solo", monthly: 1299, yearly: 12999 },
  { plan: "team", name: "PinCapture Team", monthly: 3999, yearly: 39999 },
];

async function findOrCreateProduct(plan, name) {
  const existing = await stripe.products.search({ query: `metadata['plan']:'${plan}'` });
  if (existing.data.length > 0) return existing.data[0];
  return stripe.products.create({ name, metadata: { plan } });
}

// One monthly + one yearly price per plan. Archives any other active price
// under the product that doesn't match either target amount (e.g. leftover
// from an earlier pricing pass) so the Stripe dashboard doesn't accumulate
// stale prices nothing points to.
async function findOrCreatePrices(productId, plan, monthlyAmount, yearlyAmount) {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });

  const monthlyMatch = prices.data.find(
    (p) => p.unit_amount === monthlyAmount && p.recurring?.interval === "month"
  );
  const yearlyMatch = prices.data.find(
    (p) => p.unit_amount === yearlyAmount && p.recurring?.interval === "year"
  );

  for (const stale of prices.data) {
    if (monthlyMatch && stale.id === monthlyMatch.id) continue;
    if (yearlyMatch && stale.id === yearlyMatch.id) continue;
    await stripe.prices.update(stale.id, { active: false });
    console.log(`  archived stale price ${stale.id} ($${(stale.unit_amount ?? 0) / 100}/${stale.recurring?.interval ?? "?"})`);
  }

  const monthlyPrice = monthlyMatch || await stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: monthlyAmount,
    recurring: { interval: "month" },
    metadata: { plan },
  });

  const yearlyPrice = yearlyMatch || await stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: yearlyAmount,
    recurring: { interval: "year" },
    metadata: { plan },
  });

  return { monthlyPrice, yearlyPrice };
}

async function findOrCreateWebhook(url) {
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
  const existing = endpoints.data.find((e) => e.url === url);
  if (existing) {
    console.log(`Webhook endpoint already exists for ${url} (id ${existing.id}).`);
    console.log("Its signing secret is only shown once at creation — if you don't already have");
    console.log("STRIPE_WEBHOOK_SECRET saved, delete this endpoint in the Stripe Dashboard and re-run this script.");
    return null;
  }

  return stripe.webhookEndpoints.create({
    url,
    enabled_events: [
      "checkout.session.completed",
      "customer.subscription.updated",
      "customer.subscription.deleted",
    ],
  });
}

function resolveAppUrl() {
  const fallback = "https://www.pincapturetool.com";
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!configured) return fallback;
  try {
    new URL(configured);
    return configured;
  } catch {
    console.warn(`NEXT_PUBLIC_APP_URL ("${configured}") isn't a valid URL — falling back to ${fallback}.`);
    return fallback;
  }
}

async function main() {
  const envEntries = {};

  for (const { plan, name, monthly, yearly } of PLANS) {
    const product = await findOrCreateProduct(plan, name);
    const { monthlyPrice, yearlyPrice } = await findOrCreatePrices(product.id, plan, monthly, yearly);
    envEntries[`STRIPE_PRICE_${plan.toUpperCase()}_MONTHLY`] = monthlyPrice.id;
    envEntries[`STRIPE_PRICE_${plan.toUpperCase()}_YEARLY`] = yearlyPrice.id;
    console.log(`${name}: monthly=$${monthly / 100} (${monthlyPrice.id}) yearly=$${yearly / 100} (${yearlyPrice.id})`);
  }

  // Save price IDs immediately so a later webhook failure doesn't lose this progress.
  appendToEnvLocal(envEntries);

  const webhookUrl = `${resolveAppUrl()}/api/webhooks/stripe`;
  const webhook = await findOrCreateWebhook(webhookUrl);
  if (webhook) {
    appendToEnvLocal({ STRIPE_WEBHOOK_SECRET: webhook.secret });
    console.log(`Webhook endpoint created: ${webhook.id}`);
  }

  console.log("\nDone. Remember to copy these same STRIPE_* values into the Vercel project's env vars.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
