"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { supabase } from "@/lib/supabase";

type BillingStatus = {
  plan: string;
  subscriptionStatus: string;
  subscriptionStartedAt: string | null;
  currentPeriodEnd: string | null;
  refundEligible: boolean;
  refundWindowDays: number;
};

export default function RefundPage() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    setLoading(true);
    const res = await fetch("/api/billing/status");
    if (res.ok) {
      setStatus(await res.json());
    }
    setLoading(false);
  }

  async function requestRefund() {
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/billing/refund", { method: "POST" });
    const data = await res.json();

    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Could not process refund. Please try again.");
      return;
    }

    setSuccess(true);
    setConfirming(false);
    loadStatus();
  }

  async function manageBilling() {
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--page)", fontFamily: "var(--font-sans)" }}>
      <header style={{
        minHeight: 64, background: "var(--surface)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, padding: "0 28px", flexWrap: "wrap",
      }}>
        <Link href="/" aria-label="PinCapture home" style={{ display: "block" }}>
          <BrandLogo size="app" />
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13, fontWeight: 700, padding: "8px 12px" }}>
            Dashboard
          </Link>
        </nav>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 76px" }}>
        <p style={{ margin: "0 0 8px", color: "var(--text-muted)", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>
          Refunds
        </p>
        <h1 style={{ margin: "0 0 18px", color: "var(--text-strong)", fontSize: 32 }}>Refund policy</h1>

        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
        }}>
          <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 15 }}>
            If you're not satisfied, request a full refund within <strong>7 days</strong> of your first
            payment and we'll refund it and cancel your subscription immediately. After the 7-day window,
            subscriptions are non-refundable — your plan simply runs through the end of the current billing
            cycle. You can cancel future renewals at any time from billing; you'll keep access until the
            period you already paid for ends.
          </p>
        </div>

        {loading && <p style={{ color: "var(--text-muted)" }}>Loading your subscription…</p>}

        {!loading && success && (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: 24, textAlign: "center",
          }}>
            <p style={{ margin: "0 0 6px", color: "var(--text-strong)", fontSize: 18, fontWeight: 700 }}>
              Refund processed
            </p>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
              Your payment has been refunded and your subscription is canceled. It can take a few business
              days to appear on your statement.
            </p>
          </div>
        )}

        {!loading && !success && status && (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: 24,
          }}>
            {status.subscriptionStatus === "none" || !status.subscriptionStartedAt ? (
              <>
                <p style={{ margin: "0 0 14px", color: "var(--text-muted)", fontSize: 14 }}>
                  You don't have an active subscription, so there's nothing to refund.
                </p>
                <Link href="/pricing" className="button-primary" style={{ textDecoration: "none" }}>
                  Choose a plan →
                </Link>
              </>
            ) : status.refundEligible ? (
              <>
                <p style={{ margin: "0 0 6px", color: "var(--text-strong)", fontSize: 15, fontWeight: 700 }}>
                  You're eligible for a refund
                </p>
                <p style={{ margin: "0 0 18px", color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                  Subscribed on {formatDate(status.subscriptionStartedAt)}. Requesting a refund cancels
                  your subscription immediately and refunds your payment in full.
                </p>

                {error && (
                  <div style={{
                    background: "var(--danger-soft)", border: "1px solid var(--danger)",
                    borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "var(--danger)",
                  }}>
                    {error}
                  </div>
                )}

                {!confirming ? (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setConfirming(true)}
                  >
                    Request refund
                  </button>
                ) : (
                  <div>
                    <p style={{ margin: "0 0 12px", color: "var(--text-strong)", fontSize: 14, fontWeight: 600 }}>
                      Are you sure? This immediately cancels your access.
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        className="button-primary"
                        disabled={submitting}
                        onClick={requestRefund}
                      >
                        {submitting ? "Processing…" : "Yes, refund me"}
                      </button>
                      <button
                        type="button"
                        className="button-secondary"
                        disabled={submitting}
                        onClick={() => setConfirming(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <p style={{ margin: "0 0 6px", color: "var(--text-strong)", fontSize: 15, fontWeight: 700 }}>
                  Refund window has closed
                </p>
                <p style={{ margin: "0 0 18px", color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                  Subscribed on {formatDate(status.subscriptionStartedAt)} — more than {status.refundWindowDays} days ago.
                  {status.currentPeriodEnd && (
                    <> Your plan is active through {formatDate(status.currentPeriodEnd)}.</>
                  )}{" "}
                  You can still cancel future renewals any time.
                </p>
                <button type="button" className="button-secondary" onClick={manageBilling}>
                  Manage billing →
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
