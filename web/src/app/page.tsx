import Link from "next/link";

const steps = [
  {
    num: "01",
    title: "Install the extension",
    body: "Add PinCapture to Chrome in seconds. No configuration needed, no IT ticket required.",
  },
  {
    num: "02",
    title: "Walk through your process",
    body: "Click Start Capture, then proceed normally. PinCapture records each step and takes an annotated screenshot automatically.",
  },
  {
    num: "03",
    title: "Export and share",
    body: "Download your guide as a Word document, PDF, or PowerPoint file, ready to share with your team or embed in your docs.",
  },
];

const formats = [
  { ext: "DOCX", label: "Word" },
  { ext: "PDF",  label: "PDF" },
  { ext: "PPTX", label: "PowerPoint" },
  { ext: "PPSX", label: "Slideshow" },
  { ext: "PPS",  label: "Slideshow" },
];

const mockSteps = [
  {
    n: 1,
    title: "Navigate to Finance Portal",
    desc: "Open the internal finance portal from the home dashboard",
  },
  {
    n: 2,
    title: 'Click "Upload Invoice"',
    desc: "Select the upload button in the top-right corner of the toolbar",
  },
  {
    n: 3,
    title: "Enter vendor details",
    desc: "Fill in supplier name, invoice amount, and due date",
  },
];

export default function Home() {
  return (
    <div style={{ fontFamily: "var(--font-inter, system-ui, -apple-system, sans-serif)" }}>

      {/* ── Navigation ── */}
      <header
        className="anim-slide-down delay-0"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--navy)",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(20px, 4vw, 48px)",
          borderBottom: "1px solid oklch(28% 0.065 256)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/pinvest-logo.svg"
            alt="Pinvest"
            style={{ height: 19, filter: "brightness(0) invert(1)" }}
          />
          <span style={{
            background: "var(--yellow)",
            color: "var(--navy)",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
          }}>
            PinCapture
          </span>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Link
            href="/privacy"
            className="nav-links-secondary"
            style={{ color: "oklch(72% 0.018 255)", textDecoration: "none", fontSize: 13, fontWeight: 500, padding: "8px 12px" }}
          >
            Privacy
          </Link>
          <Link
            href="/support"
            className="nav-links-secondary"
            style={{ color: "oklch(72% 0.018 255)", textDecoration: "none", fontSize: 13, fontWeight: 500, padding: "8px 12px" }}
          >
            Support
          </Link>
          <Link
            href="/login"
            style={{ color: "oklch(90% 0.015 255)", textDecoration: "none", fontSize: 13, fontWeight: 600, padding: "8px 14px" }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            style={{
              background: "var(--yellow)",
              color: "var(--navy)",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: 6,
              marginLeft: 6,
              whiteSpace: "nowrap" as const,
            }}
          >
            Request access
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section style={{
        background: "var(--navy)",
        padding: "clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px) clamp(64px, 8vw, 96px)",
      }}>
        <div className="hero-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Left: headline + CTAs */}
          <div>
            <div className="anim-fade-up delay-0" style={{ marginBottom: 22 }}>
              <span style={{
                display: "inline-block",
                background: "oklch(27% 0.068 256)",
                color: "oklch(72% 0.025 255)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                padding: "5px 12px",
                borderRadius: 4,
                border: "1px solid oklch(32% 0.062 256)",
              }}>
                Chrome Extension + Web App
              </span>
            </div>

            <h1
              className="anim-fade-up delay-100"
              style={{
                color: "oklch(97% 0.006 255)",
                fontSize: "clamp(34px, 4.8vw, 56px)",
                lineHeight: 1.04,
                fontWeight: 800,
                letterSpacing: "-0.028em",
                margin: "0 0 22px",
              }}
            >
              Turn any browser
              <br />workflow into a
              <br />
              <span style={{ color: "var(--yellow)" }}>shareable guide</span>
            </h1>

            <p
              className="anim-fade-up delay-200"
              style={{
                color: "oklch(70% 0.022 255)",
                fontSize: 17,
                lineHeight: 1.72,
                margin: "0 0 36px",
                maxWidth: "52ch",
              }}
            >
              PinCapture records your clicks and annotations as you work,
              then exports them as Word, PDF, or PowerPoint documentation
              your team can actually use.
            </p>

            <div className="anim-fade-up delay-300" style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
              <Link
                href="/register"
                style={{
                  background: "var(--yellow)",
                  color: "var(--navy)",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 700,
                  padding: "13px 26px",
                  borderRadius: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                Request access <span aria-hidden>→</span>
              </Link>
              <Link
                href="/login"
                style={{
                  color: "oklch(88% 0.015 255)",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "12px 26px",
                  borderRadius: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1px solid oklch(34% 0.060 256)",
                }}
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Right: product mockup */}
          <div
            className="hero-mockup anim-slide-right delay-200"
            style={{
              background: "var(--surface)",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 36px 72px oklch(10% 0.09 256 / 0.45), 0 0 0 1px oklch(32% 0.062 256)",
            }}
          >
            {/* Window chrome */}
            <div style={{
              background: "oklch(24% 0.072 256)",
              padding: "11px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["oklch(55% 0.18 25)", "oklch(72% 0.17 85)", "oklch(62% 0.17 148)"].map((c, i) => (
                  <div
                    key={i}
                    style={{ width: 10, height: 10, borderRadius: "50%", background: c }}
                  />
                ))}
              </div>
              <div style={{
                background: "oklch(17% 0.065 256)",
                borderRadius: 4,
                padding: "4px 10px",
                fontSize: 11,
                color: "oklch(62% 0.18 148)",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                Recording
              </div>
            </div>

            {/* Guide header */}
            <div style={{
              padding: "15px 20px 13px",
              borderBottom: "1px solid var(--border)",
              background: "oklch(99% 0.003 255)",
            }}>
              <div style={{
                fontSize: 10,
                color: "var(--text-muted)",
                fontWeight: 700,
                marginBottom: 4,
                textTransform: "uppercase" as const,
                letterSpacing: "0.07em",
              }}>
                Guide in progress
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>
                How to process a vendor invoice
              </div>
            </div>

            {/* Steps */}
            {mockSteps.map((step, i) => (
              <div
                key={step.n}
                className={`anim-fade-up delay-${(i + 4) * 100}`}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "13px 20px",
                  borderBottom: "1px solid oklch(92% 0.008 255)",
                  alignItems: "flex-start",
                  background: i === 1 ? "oklch(98% 0.006 255)" : "transparent",
                }}
              >
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "var(--yellow)",
                  color: "var(--navy)",
                  fontSize: 11,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  {step.n}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {step.desc}
                  </div>
                </div>
                {/* Screenshot thumbnail placeholder */}
                <div style={{
                  width: 50,
                  height: 34,
                  borderRadius: 4,
                  background: "var(--surface-3)",
                  flexShrink: 0,
                  overflow: "hidden",
                  position: "relative" as const,
                  border: "1px solid var(--border)",
                }}>
                  <div style={{ position: "absolute" as const, top: 6, left: 6, width: "55%", height: 2, background: "var(--border-mid)", borderRadius: 2 }} />
                  <div style={{ position: "absolute" as const, top: 11, left: 6, width: "42%", height: 2, background: "var(--border-mid)", borderRadius: 2 }} />
                  <div style={{ position: "absolute" as const, top: 16, left: 6, width: "50%", height: 2, background: "var(--border-mid)", borderRadius: 2 }} />
                  {/* Annotation rect */}
                  <div style={{
                    position: "absolute" as const,
                    bottom: 5,
                    right: 5,
                    width: 16,
                    height: 10,
                    border: "2px solid var(--yellow)",
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            ))}

            {/* Export bar */}
            <div style={{
              padding: "13px 20px",
              display: "flex",
              justifyContent: "flex-end",
              background: "var(--surface-2)",
              borderTop: "1px solid var(--border)",
            }}>
              <div style={{
                background: "var(--navy)",
                color: "oklch(97% 0.004 255)",
                fontSize: 12,
                fontWeight: 700,
                padding: "7px 16px",
                borderRadius: 6,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "default",
              }}>
                Export guide <span aria-hidden>↓</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{
        background: "oklch(99.5% 0.002 255)",
        padding: "clamp(72px, 9vw, 104px) clamp(20px, 4vw, 48px)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 60 }}>
            <p style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase" as const,
              color: "var(--text-muted)",
              margin: "0 0 12px",
            }}>
              How it works
            </p>
            <h2 style={{
              fontSize: "clamp(26px, 3.2vw, 38px)",
              fontWeight: 800,
              color: "var(--navy)",
              margin: 0,
              letterSpacing: "-0.022em",
            }}>
              Three steps from click to document
            </h2>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <div key={step.num}>
                <div style={{
                  fontSize: "clamp(52px, 7vw, 80px)",
                  fontWeight: 900,
                  color: "var(--border)",
                  lineHeight: 1,
                  marginBottom: 20,
                  letterSpacing: "-0.05em",
                  fontVariantNumeric: "tabular-nums",
                  userSelect: "none" as const,
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--navy)",
                  margin: "0 0 10px",
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 15,
                  color: "var(--text-muted)",
                  lineHeight: 1.72,
                  margin: 0,
                  maxWidth: "36ch",
                }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Export formats ── */}
      <section style={{
        background: "var(--surface-2)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "clamp(48px, 6vw, 72px) clamp(20px, 4vw, 48px)",
      }}>
        <div
          className="formats-inner"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
            flexWrap: "wrap" as const,
          }}
        >
          <div style={{ flex: "0 0 auto", maxWidth: 360 }}>
            <p style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase" as const,
              color: "var(--text-muted)",
              margin: "0 0 10px",
            }}>
              Export formats
            </p>
            <h2 style={{
              fontSize: "clamp(22px, 2.6vw, 30px)",
              fontWeight: 800,
              color: "var(--navy)",
              margin: "0 0 10px",
              letterSpacing: "-0.018em",
            }}>
              Their tool, your format
            </h2>
            <p style={{
              fontSize: 15,
              color: "var(--text-muted)",
              lineHeight: 1.68,
              margin: 0,
            }}>
              Download finished guides in whatever format your team already lives in.
            </p>
          </div>

          <div
            className="formats-pills"
            style={{ display: "flex", gap: 10, flexWrap: "wrap" as const, justifyContent: "flex-end" }}
          >
            {formats.map((f) => (
              <div
                key={f.ext}
                style={{
                  background: "oklch(99.5% 0.002 255)",
                  border: "1px solid var(--border-mid)",
                  borderRadius: 8,
                  padding: "14px 20px",
                  display: "flex",
                  flexDirection: "column" as const,
                  alignItems: "center",
                  gap: 7,
                  minWidth: 82,
                }}
              >
                <div style={{
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  background: "var(--navy)",
                  color: "oklch(98% 0.004 255)",
                  borderRadius: 4,
                  padding: "3px 7px",
                }}>
                  {f.ext}
                </div>
                <div style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontWeight: 500,
                  textAlign: "center" as const,
                }}>
                  {f.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy ── */}
      <section style={{
        background: "oklch(99.5% 0.002 255)",
        padding: "clamp(64px, 8vw, 88px) clamp(20px, 4vw, 48px)",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase" as const,
            color: "var(--text-muted)",
            margin: "0 0 12px",
          }}>
            Privacy
          </p>
          <h2 style={{
            fontSize: "clamp(22px, 2.6vw, 28px)",
            fontWeight: 800,
            color: "var(--navy)",
            margin: "0 0 18px",
            letterSpacing: "-0.018em",
          }}>
            Only what you choose to capture
          </h2>
          <p style={{
            fontSize: 15,
            color: "var(--text-muted)",
            lineHeight: 1.78,
            margin: "0 0 12px",
          }}>
            The Chrome extension captures screenshots and step details only when you explicitly start a capture session. Captured content is saved to your dashboard only when you choose to save it.
          </p>
          <p style={{
            fontSize: 15,
            color: "var(--text-muted)",
            lineHeight: 1.78,
            margin: "0 0 22px",
          }}>
            We do not sell data, track browsing activity, or collect content outside active capture sessions. Any saved guide stays in your workspace for your team.
          </p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" as const }}>
            <Link
              href="/privacy"
              style={{
                color: "var(--navy)",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Read the privacy policy
            </Link>
            <Link
              href="/support"
              style={{
                color: "var(--text-faint)",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Contact support
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{
        background: "var(--navy)",
        padding: "clamp(72px, 9vw, 104px) clamp(20px, 4vw, 48px)",
        textAlign: "center" as const,
      }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(30px, 3.8vw, 46px)",
            fontWeight: 800,
            color: "oklch(97% 0.006 255)",
            margin: "0 0 18px",
            lineHeight: 1.08,
            letterSpacing: "-0.028em",
          }}>
            Document once.
            <br />Share forever.
          </h2>
          <p style={{
            fontSize: 16,
            color: "oklch(68% 0.020 255)",
            lineHeight: 1.68,
            margin: "0 0 36px",
          }}>
            PinCapture is invite-only while in early access. Request a spot for your team today.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const }}>
            <Link
              href="/register"
              style={{
                background: "var(--yellow)",
                color: "var(--navy)",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 700,
                padding: "14px 30px",
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              Request access <span aria-hidden>→</span>
            </Link>
            <Link
              href="/login"
              style={{
                color: "oklch(86% 0.014 255)",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                padding: "13px 30px",
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid oklch(33% 0.060 256)",
              }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        background: "var(--navy-deep)",
        borderTop: "1px solid oklch(22% 0.065 256)",
        padding: "22px clamp(20px, 4vw, 48px)",
      }}>
        <div
          className="footer-inner"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src="/pinvest-logo.svg"
              alt="Pinvest"
              style={{ height: 16, filter: "brightness(0) invert(0.45)" }}
            />
            <span style={{ color: "oklch(35% 0.018 255)", fontSize: 13, fontWeight: 500 }}>
              PinCapture
            </span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" as const }}>
            <Link href="/privacy" style={{ color: "oklch(40% 0.014 255)", fontSize: 12, textDecoration: "none", fontWeight: 500 }}>
              Privacy
            </Link>
            <Link href="/support" style={{ color: "oklch(40% 0.014 255)", fontSize: 12, textDecoration: "none", fontWeight: 500 }}>
              Support
            </Link>
            <span style={{ color: "oklch(33% 0.012 255)", fontSize: 12 }}>
              © 2026 flowlog.dev
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
