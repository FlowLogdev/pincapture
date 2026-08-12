"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }

    router.push("/check-email");
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
        {/* Card header */}
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
            Create your account
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
            Start capturing and documenting your workflows in minutes
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block", fontSize: 13, fontWeight: 600,
              color: "var(--text)", marginBottom: 6,
            }}>
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Morgan"
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

          <div style={{ marginBottom: 16 }}>
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
              placeholder="At least 8 characters"
              required
              minLength={8}
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

          <div style={{ marginBottom: 22 }}>
            <label style={{
              display: "block", fontSize: 13, fontWeight: 600,
              color: "var(--text)", marginBottom: 6,
            }}>
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
              onFocus={(e) => (e.target.style.borderColor = "var(--text-strong)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
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
            {loading ? "Creating account…" : "Create account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-faint)", marginTop: 22, marginBottom: 0 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--text-strong)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>

      <p style={{ marginTop: 28, fontSize: 12, color: "var(--text-faint)" }}>
        © 2026 PinCapture
      </p>
    </div>
  );
}
