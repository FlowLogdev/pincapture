"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";

async function createProfile(session: Session) {
  await fetch("/api/auth/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: session.user.id,
      email: session.user.email,
      fullName: session.user.user_metadata?.full_name ?? "",
    }),
  });
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function handleAuth() {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) {
          await createProfile(data.session);
          router.replace("/dashboard");
          return;
        }
      }

      const queryParams = new URLSearchParams(window.location.search);
      const tokenHash = queryParams.get("token_hash");
      const type = queryParams.get("type") || "email";

      if (tokenHash) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "email",
        });

        if (!error && data.session) {
          window.history.replaceState(null, "", window.location.pathname);
          await createProfile(data.session);
          router.replace("/dashboard");
          return;
        }
      }

      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error && data.session) {
          window.history.replaceState(null, "", window.location.pathname);
          await createProfile(data.session);
          router.replace("/dashboard");
          return;
        }
      }

      // getSession() automatically detects hash tokens (#access_token=...) in the URL
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        await createProfile(session);
        router.replace("/dashboard");
        return;
      }

      // Fallback: listen for auth state change (handles slight delays)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === "SIGNED_IN" && session) {
            subscription.unsubscribe();
            await createProfile(session);
            router.replace("/dashboard");
          }
        }
      );

      // Timeout — if no session after 8 seconds, link is invalid/expired
      setTimeout(() => {
        subscription.unsubscribe();
        setMessage("Link expired or invalid. Redirecting…");
        setTimeout(() => router.replace("/login?error=auth_failed"), 2000);
      }, 8000);
    }

    handleAuth();
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh", background: "var(--page)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-sans)",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid var(--text-strong)", borderTopColor: "transparent",
          margin: "0 auto 16px",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "var(--text-muted)", fontSize: 15, margin: 0 }}>{message}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
