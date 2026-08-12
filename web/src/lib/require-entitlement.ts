import { NextResponse } from "next/server";
import { createClient, type User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isEntitled } from "@/lib/entitlement";

export async function checkEntitlement(userId: string, fallbackEmail?: string | null): Promise<boolean> {
  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profile } = await service
    .from("profiles")
    .select("email, subscription_status")
    .eq("id", userId)
    .maybeSingle();

  return isEntitled({
    email: profile?.email || fallbackEmail,
    subscription_status: profile?.subscription_status,
  });
}

export type EntitledUserResult =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

export async function requireEntitledUser(): Promise<EntitledUserResult> {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Your session expired. Please sign in again." }, { status: 401 }),
    };
  }

  if (!(await checkEntitlement(user.id, user.email))) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Subscribe to continue using PinCapture." }, { status: 402 }),
    };
  }

  return { ok: true, user };
}
