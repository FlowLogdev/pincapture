import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getStripe, priceIdFor, type BillingInterval, type PlanId } from "@/lib/stripe";
import { getPublicAppUrl } from "@/lib/app-url";

const PLAN_IDS: PlanId[] = ["solo", "team"];
const INTERVALS: BillingInterval[] = ["monthly", "yearly"];

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Your session expired. Please sign in again." }, { status: 401 });
  }

  const { plan, interval } = (await req.json()) as { plan?: string; interval?: string };

  if (!PLAN_IDS.includes(plan as PlanId) || !INTERVALS.includes(interval as BillingInterval)) {
    return NextResponse.json({ error: "Invalid plan or billing interval." }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .maybeSingle();

  const stripe = getStripe();
  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email || undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await service.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const appUrl = getPublicAppUrl();

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceIdFor(plan as PlanId, interval as BillingInterval), quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/billing?checkout=cancelled`,
    client_reference_id: user.id,
    subscription_data: { metadata: { supabase_user_id: user.id } },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
