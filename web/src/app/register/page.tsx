"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: fullName.trim(), email: email.trim() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }

    router.push("/pending-approval");
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
        {/* Card header */}
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
            Request access
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
            Your request will be reviewed and approved by an admin
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block", fontSize: 13, fontWeight: 600,
              color: "#374151", marginBottom: 6,
            }}>
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Smith"
              required
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
            {loading ? "Submitting…" : "Request access →"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "#9ca3af", marginTop: 22, marginBottom: 0 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#023465", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>

      <p style={{ marginTop: 28, fontSize: 12, color: "#9ca3af" }}>
        © 2026 Pinvest LLC
      </p>
    </div>
  );
}
