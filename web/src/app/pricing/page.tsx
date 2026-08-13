"use client";

import { useRouter } from "next/navigation";
import { MarketingHeader, MarketingFooter } from "@/components/marketing-nav";
import { PricingPlans } from "@/components/pricing-plans";

export default function PricingPage() {
  const router = useRouter();

  function handleSelect() {
    router.push("/register");
  }

  return (
    <div className="marketing-shell">
      <MarketingHeader />

      <main>
        <section className="marketing-section pricing-section">
          <div className="marketing-container pricing-layout">
            <div className="pricing-intro">
              <span className="section-eyebrow">Simple pricing</span>
              <h2 className="section-heading">Simple pricing for work worth repeating.</h2>
              <p className="section-copy">
                Start lean, prove the workflow, and expand when more people need to capture and share documentation.
              </p>
              <div className="pricing-note">
                <strong>Save two months with annual billing.</strong>
                <span>Need more than five users? Contact support for volume pricing.</span>
              </div>
            </div>

            <PricingPlans onSelect={handleSelect} ctaLabel={() => "Get started →"} />
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
