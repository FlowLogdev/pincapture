"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { PricingPlans } from "@/components/pricing-plans";

export default function PricingPage() {
  const router = useRouter();

  function handleSelect() {
    router.push("/register");
  }

  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <div className="marketing-container marketing-nav">
          <Link href="/" className="brand-lockup" aria-label="PinCapture home">
            <BrandLogo size="marketing" />
          </Link>

          <nav className="marketing-links" aria-label="Primary navigation">
            <Link href="/#product">Product</Link>
            <Link href="/#workflow">How it works</Link>
            <Link href="/#formats">Formats</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/docs">Docs</Link>
          </nav>

          <div className="marketing-actions">
            <Link href="/login" className="nav-sign-in">Sign in</Link>
            <Link href="/register" className="button-primary">Get started</Link>
          </div>
        </div>
      </header>

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

      <footer className="marketing-footer">
        <div className="marketing-container footer-layout">
          <div>
            <Link href="/" className="footer-brand">
              <BrandLogo size="marketing" />
            </Link>
            <div className="footer-copy">Capture better documentation from the browser.</div>
          </div>
          <div className="footer-links">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/refund">Refunds</Link>
            <Link href="/support">Support</Link>
            <Link href="/docs">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
