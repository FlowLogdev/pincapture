import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPublicAppUrl } from "@/lib/app-url";

export async function POST(req: NextRequest) {
  const { email } = (await req.json()) as { email?: string };

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Server is not configured yet." }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const appUrl = getPublicAppUrl();

  await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${appUrl}/reset-password`,
  });

  // Always return success regardless of whether the email exists, so this
  // endpoint can't be used to enumerate registered accounts.
  return NextResponse.json({ ok: true });
}
