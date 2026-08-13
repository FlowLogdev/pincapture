import Image from "next/image";
import Link from "next/link";
import { MarketingHeader, MarketingFooter } from "@/components/marketing-nav";

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

export default function FeaturesPage() {
  return (
    <div className="marketing-shell">
      <MarketingHeader />

      <main>
        <section className="hero-section">
          <div className="marketing-container hero-layout">
            <div className="hero-copy">
              <span className="hero-kicker">Everything in one workspace</span>
              <h1 className="hero-title">Built to capture, refine, and share process documentation.</h1>
              <p className="hero-description">
                PinCapture combines screen recording, annotated screenshots, and polished exports so you
                never have to rebuild the same guide by hand.
              </p>
              <div className="hero-actions">
                <Link href="/register" className="button-primary">Get started</Link>
                <Link href="/pricing" className="button-secondary">See pricing</Link>
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

        <section className="marketing-section">
          <div className="marketing-container workflow-grid">
            <div>
              <h2 className="section-heading">From live work to useful documentation.</h2>
              <p className="section-copy">
                PinCapture follows the way your team already works, then turns the result into
                documentation that is ready to use.
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

        <section className="marketing-section">
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

        <section className="marketing-section">
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
