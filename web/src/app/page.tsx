import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#f6f7fb",
      color: "#0f172a",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <header style={{
        height: 64,
        background: "#023465",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/pinvest-logo.svg"
            alt="Pinvest"
            style={{ height: 22, filter: "brightness(0) invert(1)" }}
          />
          <span style={{
            background: "rgba(255,221,0,0.16)",
            color: "#ffdd00",
            borderRadius: 5,
            padding: "3px 9px",
            fontSize: 11,
            fontWeight: 800,
          }}>
            PinCapture
          </span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/privacy" style={navLinkStyle}>Privacy</Link>
          <Link href="/support" style={navLinkStyle}>Support</Link>
          <Link href="/login" style={navLinkStyle}>Sign in</Link>
          <Link href="/register" style={primaryLinkStyle}>Request access</Link>
        </nav>
      </header>

      <section style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "72px 24px 42px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, 0.9fr)",
        gap: 36,
        alignItems: "center",
      }}>
        <div>
          <h1 style={{
            margin: "0 0 16px",
            color: "#023465",
            fontSize: 42,
            lineHeight: 1.08,
            letterSpacing: 0,
          }}>
            PinCapture
          </h1>
          <p style={{
            margin: "0 0 24px",
            color: "#475569",
            fontSize: 17,
            lineHeight: 1.65,
            maxWidth: 620,
          }}>
            Capture browser clicks as step-by-step process guides, then export them
            as Word, PDF, PPTX, PPSX, or PPS files.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/login" style={primaryLargeLinkStyle}>Sign in</Link>
            <Link href="/register" style={secondaryLargeLinkStyle}>Request access</Link>
          </div>
        </div>

        <div style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 18,
          boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
        }}>
          <div style={{ height: 190, borderRadius: 6, background: "#eef2ff", padding: 14 }}>
            <div style={{ height: 20, width: "44%", background: "#023465", borderRadius: 4, marginBottom: 14 }} />
            {[1, 2, 3].map((step) => (
              <div key={step} style={{
                background: "#fff",
                border: "1px solid #dbe3ef",
                borderRadius: 6,
                padding: 10,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <span style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#ffdd00",
                  color: "#023465",
                  fontSize: 11,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {step}
                </span>
                <span style={{ height: 10, flex: 1, background: "#cbd5e1", borderRadius: 4 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "22px 24px 72px",
      }}>
        <div style={{
          background: "#fff",
          border: "1px solid #dbe3ef",
          borderRadius: 8,
          padding: 28,
        }}>
          <p style={{
            margin: "0 0 8px",
            color: "#64748b",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0,
          }}>
            Privacy Policy
          </p>
          <h2 style={{ margin: "0 0 12px", color: "#023465", fontSize: 24 }}>
            We collect only the content you choose to capture
          </h2>
          <p style={{ margin: "0 0 12px", color: "#475569", lineHeight: 1.7, fontSize: 15 }}>
            PinCapture is designed for internal process documentation. The Chrome
            extension captures screenshots and step details only when you explicitly
            start a capture session, and captured content is saved only when you
            choose to save it to your PinCapture dashboard.
          </p>
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.7, fontSize: 15 }}>
            We do not sell data, track browsing activity, collect unrelated website
            content, or use captured information for advertising. Any saved guide
            remains in your PinCapture workspace for your team&apos;s use.
          </p>
          <Link href="/privacy" style={{
            display: "inline-flex",
            marginTop: 16,
            color: "#023465",
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
          }}>
            Read the full privacy policy
          </Link>
          <Link href="/support" style={{
            display: "inline-flex",
            marginTop: 16,
            marginLeft: 18,
            color: "#023465",
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
          }}>
            Contact support
          </Link>
        </div>
      </section>
    </main>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.78)",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 700,
  padding: "8px 12px",
};

const primaryLinkStyle: React.CSSProperties = {
  color: "#023465",
  background: "#ffdd00",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 800,
  padding: "9px 14px",
  borderRadius: 7,
};

const primaryLargeLinkStyle: React.CSSProperties = {
  ...primaryLinkStyle,
  display: "inline-flex",
  padding: "11px 18px",
};

const secondaryLargeLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  color: "#023465",
  background: "#fff",
  border: "1px solid #cbd5e1",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 800,
  padding: "10px 18px",
  borderRadius: 7,
};
