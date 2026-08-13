import Image from "next/image";
import Link from "next/link";
import { MarketingHeader, MarketingFooter } from "@/components/marketing-nav";

const capabilities = [
  "Browser screenshots",
  "MP4 screen recording",
  "10-minute captures",
  "Five export formats",
];

export default function Home() {
  return (
    <div className="marketing-shell">
      <MarketingHeader />

      <main>
        <section className="hero-section">
          <div className="marketing-container hero-layout">
            <div className="hero-copy">
              <span className="hero-kicker">Screen capture for teams</span>
              <h1 className="hero-title">Document any process while you do it.</h1>
              <p className="hero-description">
                Record your screen, capture every step, and publish clear guides or videos your team can reuse.
              </p>
              <div className="hero-actions">
                <Link href="/register" className="button-primary">Get started</Link>
                <Link href="/features" className="button-secondary">See how it works</Link>
              </div>
            </div>

            <div className="hero-media">
              <Image
                src="/images/pincapture-workflow-hero.png"
                alt="A professional documenting a browser workflow at a desk"
                fill
                sizes="(max-width: 980px) 100vw, 56vw"
                priority
              />
            </div>
          </div>
        </section>

        <section className="capability-strip" aria-label="Product capabilities">
          <div className="marketing-container capability-list">
            {capabilities.map((capability) => <span key={capability}>{capability}</span>)}
          </div>
        </section>

        <section className="marketing-section">
          <div className="marketing-container" style={{ maxWidth: 640, textAlign: "center" }}>
            <h2 className="section-heading">From live work to useful documentation.</h2>
            <p className="section-copy">
              Capture, refine, and export in five formats — see the full workflow and every feature.
            </p>
            <Link href="/features" className="button-primary">See all features →</Link>
          </div>
        </section>

        <section id="pricing" className="marketing-section pricing-section">
          <div className="marketing-container" style={{ maxWidth: 640, textAlign: "center" }}>
            <span className="section-eyebrow">Simple pricing</span>
            <h2 className="section-heading">Simple pricing for work worth repeating.</h2>
            <p className="section-copy">
              Solo starts at $12.99/mo, Team at $39.99/mo — save two months with annual billing.
            </p>
            <Link href="/pricing" className="button-primary">See full pricing →</Link>
          </div>
        </section>

        <section className="marketing-section">
          <div className="marketing-container security-layout">
            <div className="story-image">
              <Image
                src="/images/pincapture-team-review.png"
                alt="Two teammates reviewing a documented process together"
                fill
                sizes="(max-width: 980px) 100vw, 54vw"
              />
            </div>
            <div className="security-copy">
              <h2>Built for real team workflows.</h2>
              <p>PinCapture keeps capture, review, and distribution in one practical workspace.</p>
              <div className="trust-list">
                <div className="trust-item">
                  <strong>Secure by default</strong>
                  <span>Every account is protected by authentication and a verified subscription.</span>
                </div>
                <div className="trust-item">
                  <strong>Recoverable records</strong>
                  <span>Archive, trash, restore, and manage saved guides without losing track of work.</span>
                </div>
                <div className="trust-item">
                  <strong>Portable documentation</strong>
                  <span>Download guides and recordings for training, support, and internal operations.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="marketing-container cta-panel">
            <div>
              <h2>Make every process easier to repeat.</h2>
              <p>Start building reusable team documentation directly from the work happening on screen.</p>
            </div>
            <Link href="/register" className="button-primary">Get started</Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
