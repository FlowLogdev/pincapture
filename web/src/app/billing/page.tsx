"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { supabase } from "@/lib/supabase";
import { PricingPlans, type Interval, type PlanId } from "@/components/pricing-plans";

export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState("");

  async function subscribe(plan: PlanId, interval: Interval) {
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

            <PricingPlans onSelect={subscribe} loadingPlan={loadingPlan} />
          </div>
        </section>
      </main>
    </div>
  );
}
