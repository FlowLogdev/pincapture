"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { supabase } from "@/lib/supabase";

type PlanId = "solo" | "team";
type Interval = "monthly" | "yearly";

export default function BillingPage() {
  const [interval, setInterval] = useState<Interval>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState("");

  async function subscribe(plan: PlanId) {
    setError("");
    setLoadingPlan(plan);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = "/login";
      return;
    }

    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, interval }),
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      setError(data.error || "Could not start checkout. Please try again.");
      setLoadingPlan(null);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <div className="marketing-container marketing-nav">
          <Link href="/" className="brand-lockup" aria-label="PinCapture home">
            <BrandLogo size="marketing" />
          </Link>
          <div className="marketing-actions">
            <button
              type="button"
              onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/login"))}
              className="nav-sign-in"
              style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="marketing-section pricing-section">
          <div className="marketing-container pricing-layout">
            <div className="pricing-intro">
              <span className="section-eyebrow">One step left</span>
              <h2 className="section-heading">Choose a plan to activate your workspace.</h2>
              <p className="section-copy">
                Your account is confirmed — pick a plan to start capturing and sharing documentation.
              </p>
              <div className="pricing-note">
                <div
                  role="tablist"
                  aria-label="Billing interval"
                  style={{ display: "inline-flex", gap: 6, background: "var(--surface-2)", borderRadius: 8, padding: 4, marginTop: 8 }}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={interval === "monthly"}
                    onClick={() => setInterval("monthly")}
                    style={intervalButtonStyle(interval === "monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={interval === "yearly"}
                    onClick={() => setInterval("yearly")}
                    style={intervalButtonStyle(interval === "yearly")}
                  >
                    Yearly — save 2 months
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                background: "var(--danger-soft)", border: "1px solid var(--danger)",
                borderRadius: 8, padding: "10px 14px", marginBottom: 16,
                fontSize: 13, color: "var(--danger)",
              }}>
                {error}
              </div>
            )}

            <div className="pricing-plans">
              <article className="pricing-plan">
                <div className="pricing-plan-header">
                  <div>
                    <span className="pricing-plan-name">Solo</span>
                    <p>For one person documenting recurring work.</p>
                  </div>
                  <div className="pricing-price">
                    <strong>${interval === "monthly" ? "12.99" : "10.83"}</strong>
                    <span>per month</span>
                  </div>
                </div>
                <ul className="pricing-features">
                  <li>One user account</li>
                  <li>Screenshot guides and screen recordings</li>
                  <li>MP4 videos up to 10 minutes</li>
                  <li>Word, PDF, PowerPoint, and slideshow exports</li>
                  <li>Video downloads, archive, and recovery</li>
                </ul>
                <div className="pricing-plan-footer">
                  <span>{interval === "yearly" ? "$129.99 billed yearly" : "Billed monthly"}</span>
                  <button
                    type="button"
                    className="button-secondary"
                    disabled={loadingPlan !== null}
                    onClick={() => subscribe("solo")}
                  >
                    {loadingPlan === "solo" ? "Redirecting…" : "Subscribe →"}
                  </button>
                </div>
              </article>

              <article className="pricing-plan pricing-plan-featured">
                <div className="pricing-plan-header">
                  <div>
                    <span className="pricing-plan-name">Team</span>
                    <p>For a small team standardizing how work gets done.</p>
                  </div>
                  <div className="pricing-price">
                    <strong>${interval === "monthly" ? "39.99" : "33.33"}</strong>
                    <span>per month</span>
                  </div>
                </div>
                <ul className="pricing-features">
                  <li>Up to five user accounts</li>
                  <li>Everything in Solo</li>
                  <li>Priority support</li>
                  <li>Guide and recording organization</li>
                  <li>Support ticket workflow</li>
                </ul>
                <div className="pricing-plan-footer">
                  <span>{interval === "yearly" ? "$399.99 billed yearly" : "Billed monthly"}</span>
                  <button
                    type="button"
                    className="button-primary"
                    disabled={loadingPlan !== null}
                    onClick={() => subscribe("team")}
                  >
                    {loadingPlan === "team" ? "Redirecting…" : "Subscribe →"}
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function intervalButtonStyle(active: boolean): React.CSSProperties {
  return {
    border: 0,
    borderRadius: 6,
    padding: "8px 14px",
    background: active ? "var(--text-strong)" : "transparent",
    color: active ? "var(--surface)" : "var(--text-strong)",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}
