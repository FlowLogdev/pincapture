"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { supabase } from "@/lib/supabase";
import { GoogleSignInButton, AuthDivider } from "@/components/google-signin-button";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "missing_code" || err === "auth_failed") {
      setError("Your sign-in link has expired or is invalid. Enter your email below to get a new one.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (mode === "password" && !password) return;

    setLoading(true);
    setError("");

    if (mode === "password") {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Could not sign in. Check the email and password.");
        return;
      }

      window.location.href = "/dashboard";
      return;
    }

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }

    setSuccess(true);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--page)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 24,
      fontFamily: "var(--font-sans)",
    }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/" aria-label="PinCapture home" style={{ display: "block" }}>
          <BrandLogo size="auth" />
        </Link>
      </div>

      <div style={{
        background: "var(--surface)", borderRadius: 14,
        padding: "42px 38px", width: "100%", maxWidth: 420,
        boxShadow: "0 4px 24px rgb(20 23 26 / 0.07)",
        border: "1px solid var(--border)",
      }}>
        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "var(--accent)", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 14 }}>
              SIGN-IN LINK SENT
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-strong)", margin: "0 0 10px" }}>
              Check your inbox
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.65, margin: "0 0 20px" }}>
              We sent a sign-in link to <strong>{email}</strong>. Click it to access PinCapture. It expires in 1 hour.
            </p>
            <p style={{ color: "var(--text-faint)", fontSize: 13, margin: 0 }}>
              Didn't get it? Check spam or{" "}
              <button
                onClick={() => setSuccess(false)}
                style={{ color: "var(--text-strong)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13 }}
              >
                try again
              </button>.
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <div style={{
                display: "inline-flex", background: "var(--text-strong)",
                borderRadius: 8, padding: "5px 14px", marginBottom: 18,
              }}>
                <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13, letterSpacing: 0.3 }}>
                  PinCapture
                </span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-strong)", margin: "0 0 6px" }}>
                Sign in to PinCapture
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
                {mode === "magic" ? "We'll send a sign-in link to your email" : "Use your account password"}
              </p>
            </div>

            <GoogleSignInButton />
            <AuthDivider label="OR" />

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              background: "var(--surface-2)",
              borderRadius: 8,
              padding: 4,
              marginBottom: 18,
            }}>
              <button type="button" onClick={() => setMode("magic")} style={modeButtonStyle(mode === "magic")}>
                Magic link
              </button>
              <button type="button" onClick={() => setMode("password")} style={modeButtonStyle(mode === "password")}>
                Password
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 22 }}>
                <label style={{
                  display: "block", fontSize: 13, fontWeight: 600,
                  color: "var(--text)", marginBottom: 6,
                }}>
                  Work email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoFocus
                  style={{
                    width: "100%", padding: "10px 13px",
                    borderRadius: 8, border: "1px solid var(--border-strong)",
                    fontSize: 14, outline: "none", boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--text-strong)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
                />
              </div>

              {mode === "password" && (
                <div style={{ marginBottom: 22 }}>
                  <label style={{
                    display: "block", fontSize: 13, fontWeight: 600,
                    color: "var(--text)", marginBottom: 6,
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    style={{
                      width: "100%", padding: "10px 13px",
                      borderRadius: 8, border: "1px solid var(--border-strong)",
                      fontSize: 14, outline: "none", boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--text-strong)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
                  />
                </div>
              )}

              {error && (
                <div style={{
                  background: "var(--danger-soft)", border: "1px solid var(--danger)",
                  borderRadius: 8, padding: "10px 14px",
                  marginBottom: 16, fontSize: 13, color: "var(--danger)",
                  lineHeight: 1.5,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "12px",
                  background: loading ? "var(--accent-hover)" : "var(--text-strong)",
                  color: "var(--surface)", border: "none", borderRadius: 8,
                  fontSize: 15, fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit", transition: "background 0.15s",
                }}
              >
                {loading ? (mode === "password" ? "Signing in..." : "Sending link...") : (mode === "password" ? "Sign in" : "Send sign-in link ->")}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-faint)", marginTop: 22, marginBottom: 0 }}>
              Don't have an account?{" "}
              <Link href="/register" style={{ color: "var(--text-strong)", fontWeight: 600, textDecoration: "none" }}>
                Create one
              </Link>
            </p>
          </>
        )}
      </div>

      <p style={{ marginTop: 28, fontSize: 12, color: "var(--text-faint)" }}>
        © 2026 PinCapture
      </p>
    </div>
  );
}

function modeButtonStyle(active: boolean): React.CSSProperties {
  return {
    border: 0,
    borderRadius: 6,
    padding: "8px 10px",
    background: active ? "var(--text-strong)" : "transparent",
    color: active ? "var(--surface)" : "var(--text-strong)",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}
