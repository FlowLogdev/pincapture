"use client";

import { supabase } from "@/lib/supabase";
import { getPublicAppUrl } from "@/lib/app-url";

export function GoogleSignInButton() {
  async function handleClick() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${getPublicAppUrl()}/auth/callback-client` },
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        width: "100%", padding: "10px 13px",
        borderRadius: 8, border: "1px solid var(--border-strong)",
        background: "var(--surface)", color: "var(--text-strong)",
        fontSize: 14, fontWeight: 600, fontFamily: "inherit",
        cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center", gap: 10,
      }}
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      <span style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.98v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.05l2.99-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.95l2.99 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
