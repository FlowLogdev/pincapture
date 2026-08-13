import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { isEntitled } from "@/lib/entitlement";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const requiresEntitlement = path.startsWith("/dashboard") || path.startsWith("/guide");
  const isProtected = requiresEntitlement || path === "/billing" || path === "/refund";
  const isAuthPage =
    path === "/login" ||
    path === "/register" ||
    path === "/check-email";
  const isRoot = path === "/";

  // Unauthenticated: block protected routes
  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Authenticated: skip all auth/landing pages → go straight to dashboard
  if (user && (isAuthPage || isRoot)) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  // Authenticated but not entitled: send to /billing instead of the app
  if (user && requiresEntitlement) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, email")
      .eq("id", user.id)
      .maybeSingle();

    const entitled = isEntitled({
      email: profile?.email || user.email,
      subscription_status: profile?.subscription_status,
    });

    if (!entitled) {
      return NextResponse.redirect(new URL("/billing", request.nextUrl));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/guide/:path*", "/login", "/register", "/check-email", "/billing", "/refund"],
};
