"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "ready" | "invalid" | "saving" | "done">("verifying");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function establishRecoverySession() {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchangeError && data.session) {
          window.history.replaceState(null, "", window.location.pathname);
          setStatus("ready");
          return;
        }
      }

      const queryParams = new URLSearchParams(window.location.search);
      const tokenHash = queryParams.get("token_hash");
      if (tokenHash) {
        const { data, error: otpError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (!otpError && data.session) {
          window.history.replaceState(null, "", window.location.pathname);
          setStatus("ready");
          return;
        }
      }

      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!sessionError && data.session) {
          window.history.replaceState(null, "", window.location.pathname);
          setStatus("ready");
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      setStatus(session ? "ready" : "invalid");
    }

    establishRecoverySession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("saving");
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message || "Could not update password. Please try again.");
      setStatus("ready");
      return;
    }

    setStatus("done");
    setTimeout(() => router.replace("/dashboard"), 1500);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--page)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 24,
      fontFamily: "var(--font-sans)",
    }}>
      <div style={{ marginBottom: 32 }}>
        <BrandLogo size="auth" />
      </div>

      <div style={{
        background: "var(--surface)", borderRadius: 14,
        padding: "42px 38px", width: "100%", maxWidth: 420,
        boxShadow: "0 4px 24px rgb(20 23 26 / 0.07)",
        border: "1px solid var(--border)",
      }}>
        {status === "verifying" && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
            Verifying your reset link…
          </p>
        )}

        {status === "invalid" && (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-strong)", margin: "0 0 10px" }}>
              Link expired or invalid
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.65 }}>
              Request a new reset link from the{" "}
              <a href="/forgot-password" style={{ color: "var(--text-strong)", fontWeight: 600 }}>
                forgot password page
              </a>.
            </p>
          </div>
        )}

        {status === "done" && (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-strong)", margin: "0 0 10px" }}>
              Password updated
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Taking you to your dashboard…</p>
          </div>
        )}

        {(status === "ready" || status === "saving") && (
          <>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-strong)", margin: "0 0 6px" }}>
                Set a new password
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
                Choose a new password for your account
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoFocus
                  style={{
                    width: "100%", padding: "10px 13px",
                    borderRadius: 8, border: "1px solid var(--border-strong)",
                    fontSize: 14, outline: "none", boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  minLength={8}
                  style={{
                    width: "100%", padding: "10px 13px",
                    borderRadius: 8, border: "1px solid var(--border-strong)",
                    fontSize: 14, outline: "none", boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {error && (
                <div style={{
                  background: "var(--danger-soft)", border: "1px solid var(--danger)",
                  borderRadius: 8, padding: "10px 14px",
                  marginBottom: 16, fontSize: 13, color: "var(--danger)",
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "saving"}
                style={{
                  width: "100%", padding: "12px",
                  background: status === "saving" ? "var(--accent-hover)" : "var(--text-strong)",
                  color: "var(--surface)", border: "none", borderRadius: 8,
                  fontSize: 15, fontWeight: 700,
                  cursor: status === "saving" ? "not-allowed" : "pointer",
                  fontFamily: "inherit", transition: "background 0.15s",
                }}
              >
                {status === "saving" ? "Saving…" : "Update password →"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
