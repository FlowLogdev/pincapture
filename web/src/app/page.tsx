import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const capabilities = [
  "Browser screenshots",
  "MP4 screen recording",
  "10-minute captures",
  "Five export formats",
];

const workflow = [
  {
    number: "01",
    title: "Capture the process",
    body: "Record your screen or collect annotated screenshots while you complete the work normally.",
  },
  {
    number: "02",
    title: "Refine the guide",
    body: "Review each step, edit the instructions, and keep the context your team needs.",
  },
  {
    number: "03",
    title: "Share it anywhere",
    body: "Publish a link or download a polished file for onboarding, support, and operations.",
  },
];

const formats = [
  ["DOCX", "Word"],
  ["PDF", "Document"],
  ["PPTX", "Presentation"],
  ["PPSX", "Slideshow"],
  ["MP4", "Video"],
];

export default function Home() {
  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <div className="marketing-container marketing-nav">
          <Link href="/" className="brand-lockup" aria-label="PinCapture home">
            <BrandLogo size="marketing" />
          </Link>

          <nav className="marketing-links" aria-label="Primary navigation">
            <a href="#product">Product</a>
            <a href="#workflow">How it works</a>
            <a href="#formats">Formats</a>
            <a href="#pricing">Pricing</a>
            <Link href="/docs">Docs</Link>
          </nav>

          <div className="marketing-actions">
            <Link href="/login" className="nav-sign-in">Sign in</Link>
            <Link href="/register" className="button-primary">Request access</Link>
          </div>
        </div>
      </header>

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
                <Link href="/register" className="button-primary">Request access</Link>
                <a href="#workflow" className="button-secondary">See how it works</a>
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

        <section id="workflow" className="marketing-section">
          <div className="marketing-container workflow-grid">
            <div>
              <h2 className="section-heading">From live work to useful documentation.</h2>
              <p className="section-copy">
                PinCapture follows the way your team already works, then turns the result into documentation that is ready to use.
              </p>
            </div>
            <div className="workflow-list">
              {workflow.map((item) => (
                <article className="workflow-item" key={item.title}>
                  <span className="workflow-number">{item.number}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="product" className="marketing-section">
          <div className="marketing-container benefit-grid">
            <article className="benefit-panel">
              <h3>Show the work clearly.</h3>
              <p>Combine the original screen recording with editable instructions and captured visual context.</p>
            </article>
            <article className="benefit-panel">
              <h3>Record longer workflows</h3>
              <p>Reliable resumable uploads support screen recordings up to 10 minutes.</p>
            </article>
            <article className="benefit-panel">
              <h3>Keep guides organized</h3>
              <p>Save, archive, recover, and download documentation from one workspace.</p>
            </article>
          </div>
        </section>

        <section id="formats" className="marketing-section">
          <div className="marketing-container formats-layout">
            <div className="format-copy">
              <h3>One capture. Five useful outputs.</h3>
              <p>Send the format each team already uses without rebuilding the same process by hand.</p>
            </div>
            <div className="format-list" aria-label="Export formats">
              {formats.map(([extension, label]) => (
                <div className="format-item" key={extension}>
                  <strong>{extension}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="marketing-section pricing-section">
          <div className="marketing-container pricing-layout">
            <div className="pricing-intro">
              <span className="section-eyebrow">Recommended launch pricing</span>
              <h2 className="section-heading">Simple pricing for work worth repeating.</h2>
              <p className="section-copy">
                Start lean, prove the workflow, and expand when more people need to capture and share documentation.
              </p>
              <div className="pricing-note">
                <strong>Save two months with annual billing.</strong>
                <span>Need more than five users? Contact support for volume pricing.</span>
              </div>
            </div>

            <div className="pricing-plans">
              <article className="pricing-plan">
                <div className="pricing-plan-header">
                  <div>
                    <span className="pricing-plan-name">Solo</span>
                    <p>For one person documenting recurring work.</p>
                  </div>
                  <div className="pricing-price">
                    <strong>$12</strong>
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
                  <span>$120 billed yearly</span>
                  <Link href="/register" className="button-secondary">Request access</Link>
                </div>
              </article>

              <article className="pricing-plan pricing-plan-featured">
                <div className="pricing-plan-header">
                  <div>
                    <span className="pricing-plan-name">Team</span>
                    <p>For a small team standardizing how work gets done.</p>
                  </div>
                  <div className="pricing-price">
                    <strong>$39</strong>
                    <span>per month</span>
                  </div>
                </div>
                <ul className="pricing-features">
                  <li>Up to five approved user accounts</li>
                  <li>Everything in Solo</li>
                  <li>Central access review</li>
                  <li>Guide and recording organization</li>
                  <li>Support ticket workflow</li>
                </ul>
                <div className="pricing-plan-footer">
                  <span>$390 billed yearly</span>
                  <Link href="/register" className="button-primary">Request access</Link>
                </div>
              </article>
            </div>
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
                  <strong>Controlled access</strong>
                  <span>Account requests are reviewed before workspace access is approved.</span>
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
            <Link href="/register" className="button-primary">Request access</Link>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="marketing-container footer-layout">
          <div>
            <Link href="/" className="footer-brand">
              <BrandLogo size="footer" />
            </Link>
            <div className="footer-copy">Capture better documentation from the browser.</div>
          </div>
          <div className="footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/support">Support</Link>
            <Link href="/docs">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
