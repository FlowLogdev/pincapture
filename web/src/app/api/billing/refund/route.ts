import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe";
import { isWithinRefundWindow, REFUND_WINDOW_DAYS } from "@/lib/refund";

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Your session expired. Please sign in again." }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("subscription_id, subscription_status, subscription_started_at")
    .eq("id", user.id)
    .maybeSingle();

  const hasActiveSubscription =
    profile?.subscription_id &&
    (profile.subscription_status === "active" || profile.subscription_status === "trialing");

  if (!hasActiveSubscription) {
    return NextResponse.json({ error: "No active subscription found." }, { status: 400 });
  }

  if (!isWithinRefundWindow(profile.subscription_started_at)) {
    return NextResponse.json(
      {
        error: `Refunds are only available within ${REFUND_WINDOW_DAYS} days of subscribing. You can still cancel any time from billing — your access continues through the end of the current billing period.`,
      },
      { status: 400 }
    );
  }

  const stripe = getStripe();

  try {
    const subscription = await stripe.subscriptions.retrieve(profile.subscription_id!, {
      expand: ["latest_invoice.payment_intent"],
    });

    const invoice = subscription.latest_invoice;
    const paymentIntent = invoice && typeof invoice !== "string" ? invoice.payment_intent : null;
    const paymentIntentId = typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Could not find a payment to refund. Contact support@flowlog.dev." },
        { status: 500 }
      );
    }

    await stripe.refunds.create({ payment_intent: paymentIntentId });
    await stripe.subscriptions.cancel(profile.subscription_id!);

    await service
      .from("profiles")
      .update({ subscription_status: "canceled", plan: "none" })
      .eq("id", user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not process refund. Contact support@flowlog.dev.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
