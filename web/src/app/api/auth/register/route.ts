import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPublicAppUrl } from "@/lib/app-url";

export async function POST(req: NextRequest) {
  const { email, fullName, password } = await req.json();

  if (!email?.trim() || !fullName?.trim() || !password) {
    return NextResponse.json({ error: "Full name, email, and password are required." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
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

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
      data: { full_name: fullName.trim() },
    },
  });

  if (error) {
    const message = error.message.toLowerCase().includes("already registered")
      ? "This email is already registered. Use the sign-in page instead."
      : error.message || "Could not create your account. Please try again.";
    return NextResponse.json({ error: message }, { status: error.status === 422 ? 409 : 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "Could not create your account. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
