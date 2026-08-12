import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isWithinRefundWindow, REFUND_WINDOW_DAYS } from "@/lib/refund";

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Your session expired. Please sign in again." }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("plan, subscription_status, subscription_started_at, current_period_end")
    .eq("id", user.id)
    .maybeSingle();

  const hasActiveSubscription =
    profile?.subscription_status === "active" || profile?.subscription_status === "trialing";
  const refundEligible = hasActiveSubscription && isWithinRefundWindow(profile?.subscription_started_at);

  return NextResponse.json({
    plan: profile?.plan ?? "none",
    subscriptionStatus: profile?.subscription_status ?? "none",
    subscriptionStartedAt: profile?.subscription_started_at ?? null,
    currentPeriodEnd: profile?.current_period_end ?? null,
    refundEligible,
    refundWindowDays: REFUND_WINDOW_DAYS,
  });
}
