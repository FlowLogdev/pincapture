"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    setLoading(false);
    setSent(true);
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
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "var(--accent)", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 14 }}>
              CHECK YOUR INBOX
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-strong)", margin: "0 0 10px" }}>
              Reset link sent
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
              If an account exists for <strong>{email}</strong>, we've sent a link to reset the password. It expires in 1 hour.
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
                Reset your password
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
                We'll email you a link to set a new password
              </p>
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
                />
              </div>

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
                {loading ? "Sending…" : "Send reset link →"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-faint)", marginTop: 22, marginBottom: 0 }}>
              <Link href="/login" style={{ color: "var(--text-strong)", fontWeight: 600, textDecoration: "none" }}>
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
