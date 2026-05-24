"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
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

    setLoading(true);
    setError("");

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
      minHeight: "100vh", background: "#f0f4f8",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 24,
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{ marginBottom: 32 }}>
        <img src="/pinvest-logo.svg" alt="Pinvest" style={{ height: 28 }} />
      </div>

      <div style={{
        background: "#fff", borderRadius: 14,
        padding: "42px 38px", width: "100%", maxWidth: 420,
        boxShadow: "0 4px 24px rgba(2,52,101,0.09)",
        border: "1px solid #e5e7eb",
      }}>
        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#f0f7ff", border: "2px solid #bfdbfe",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, margin: "0 auto 20px",
            }}>
              📬
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#023465", margin: "0 0 10px" }}>
              Check your inbox
            </h2>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.65, margin: "0 0 20px" }}>
              We sent a sign-in link to <strong>{email}</strong>. Click it to access PinCapture — it expires in 1 hour.
            </p>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
              Didn't get it? Check spam or{" "}
              <button
                onClick={() => setSuccess(false)}
                style={{ color: "#023465", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13 }}
              >
                try again
              </button>.
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <div style={{
                display: "inline-flex", background: "#023465",
                borderRadius: 8, padding: "5px 14px", marginBottom: 18,
              }}>
                <span style={{ color: "#FFDD00", fontWeight: 700, fontSize: 13, letterSpacing: 0.3 }}>
                  PinCapture
                </span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#023465", margin: "0 0 6px" }}>
                Sign in to PinCapture
              </h1>
              <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
                We'll send a sign-in link to your email
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 22 }}>
                <label style={{
                  display: "block", fontSize: 13, fontWeight: 600,
                  color: "#374151", marginBottom: 6,
                }}>
                  Work email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@pinvestcapital.com"
                  required
                  autoFocus
                  style={{
                    width: "100%", padding: "10px 13px",
                    borderRadius: 8, border: "1px solid #d1d5db",
                    fontSize: 14, outline: "none", boxSizing: "border-box",
                    fontFamily: "system-ui",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#023465")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              {error && (
                <div style={{
                  background: "#fef2f2", border: "1px solid #fca5a5",
                  borderRadius: 8, padding: "10px 14px",
                  marginBottom: 16, fontSize: 13, color: "#dc2626",
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
                  background: loading ? "#4b7abf" : "#023465",
                  color: "#fff", border: "none", borderRadius: 8,
                  fontSize: 15, fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "system-ui", transition: "background 0.15s",
                }}
              >
                {loading ? "Sending link…" : "Send sign-in link →"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: 13, color: "#9ca3af", marginTop: 22, marginBottom: 0 }}>
              Don't have an account?{" "}
              <Link href="/register" style={{ color: "#023465", fontWeight: 600, textDecoration: "none" }}>
                Create one
              </Link>
            </p>
          </>
        )}
      </div>

      <p style={{ marginTop: 28, fontSize: 12, color: "#9ca3af" }}>
        © 2026 Pinvest LLC
      </p>
    </div>
  );
}
