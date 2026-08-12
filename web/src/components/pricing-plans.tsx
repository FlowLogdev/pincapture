"use client";

import { useState } from "react";

export type PlanId = "solo" | "team";
export type Interval = "monthly" | "yearly";

const PLANS: Record<PlanId, {
  name: string;
  description: string;
  monthly: string;
  yearly: string;
  yearlyTotal: string;
  features: string[];
  featured?: boolean;
}> = {
  solo: {
    name: "Solo",
    description: "For one person documenting recurring work.",
    monthly: "12.99",
    yearly: "10.83",
    yearlyTotal: "$129.99 billed yearly",
    features: [
      "One user account",
      "Screenshot guides and screen recordings",
      "MP4 videos up to 10 minutes",
      "Word, PDF, PowerPoint, and slideshow exports",
      "Video downloads, archive, and recovery",
    ],
  },
  team: {
    name: "Team",
    description: "For a small team standardizing how work gets done.",
    monthly: "39.99",
    yearly: "33.33",
    yearlyTotal: "$399.99 billed yearly",
    features: [
      "Up to five user accounts",
      "Everything in Solo",
      "Priority support",
      "Guide and recording organization",
      "Support ticket workflow",
    ],
    featured: true,
  },
};

type PricingPlansProps = {
  onSelect: (plan: PlanId, interval: Interval) => void;
  loadingPlan?: PlanId | null;
  ctaLabel?: (plan: PlanId) => string;
};

export function PricingPlans({ onSelect, loadingPlan = null, ctaLabel }: PricingPlansProps) {
  const [interval, setInterval] = useState<Interval>("monthly");

  return (
    <>
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

      <div className="pricing-plans" style={{ marginTop: 24 }}>
        {(Object.keys(PLANS) as PlanId[]).map((planId) => {
          const plan = PLANS[planId];
          const loading = loadingPlan === planId;
          return (
            <article
              key={planId}
              className={plan.featured ? "pricing-plan pricing-plan-featured" : "pricing-plan"}
            >
              <div className="pricing-plan-header">
                <div>
                  <span className="pricing-plan-name">{plan.name}</span>
                  <p>{plan.description}</p>
                </div>
                <div className="pricing-price">
                  <strong>${interval === "monthly" ? plan.monthly : plan.yearly}</strong>
                  <span>per month</span>
                </div>
              </div>
              <ul className="pricing-features">
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <div className="pricing-plan-footer">
                <span>{interval === "yearly" ? plan.yearlyTotal : "Billed monthly"}</span>
                <button
                  type="button"
                  className={plan.featured ? "button-primary" : "button-secondary"}
                  disabled={loadingPlan !== null}
                  onClick={() => onSelect(planId, interval)}
                >
                  {loading ? "Redirecting…" : ctaLabel?.(planId) ?? "Subscribe →"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
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
