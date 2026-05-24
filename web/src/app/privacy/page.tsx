import Link from "next/link";

export default function PrivacyPage() {
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
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
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
        </Link>
        <Link href="/login" style={{
          color: "#023465",
          background: "#ffdd00",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 800,
          padding: "9px 14px",
          borderRadius: 7,
        }}>
          Sign in
        </Link>
      </header>

      <section style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "58px 24px 76px",
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
        <h1 style={{
          margin: "0 0 18px",
          color: "#023465",
          fontSize: 36,
          lineHeight: 1.15,
          letterSpacing: 0,
        }}>
          PinCapture Privacy Policy
        </h1>

        <div style={{
          background: "#fff",
          border: "1px solid #dbe3ef",
          borderRadius: 8,
          padding: 28,
          boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
        }}>
          <PolicySection title="What PinCapture does">
            PinCapture helps users create internal step-by-step process guides.
            The Chrome extension captures screenshots and step details only after
            a user explicitly starts recording.
          </PolicySection>

          <PolicySection title="Information PinCapture collects">
            PinCapture collects website content only when an authorized user
            explicitly starts a capture session and saves the resulting guide.
            This may include screenshots, page URLs, click labels, and step
            metadata needed to create process documentation.
          </PolicySection>

          <PolicySection title="Information we do not collect">
            We do not collect browsing history outside active capture sessions,
            monitor unrelated web activity, collect keystrokes, collect passwords,
            sell data, or use captured information for advertising or profiling.
          </PolicySection>

          <PolicySection title="Captured content">
            Screenshots, click labels, page URLs, and step metadata are captured
            only during an active capture session. That content remains local to
            the extension until the user chooses to save it to the PinCapture
            dashboard or export it.
          </PolicySection>

          <PolicySection title="How saved guides are used">
            Saved guides are stored in the user&apos;s PinCapture workspace so the
            user and authorized internal team members can view, edit, and export them.
            PinCapture does not use saved guide content for advertising.
          </PolicySection>

          <PolicySection title="Data sharing">
            We do not sell, rent, or transfer captured guide content to third
            parties for marketing, advertising, or profiling purposes.
          </PolicySection>

          <PolicySection title="Contact">
            For privacy questions about PinCapture, contact support@flowlog.dev.
          </PolicySection>

          <p style={{ margin: "28px 0 0", color: "#94a3b8", fontSize: 13 }}>
            Last updated: May 24, 2026
          </p>
        </div>
      </section>
    </main>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h2 style={{ margin: "0 0 7px", color: "#023465", fontSize: 18 }}>
        {title}
      </h2>
      <p style={{ margin: 0, color: "#475569", lineHeight: 1.7, fontSize: 15 }}>
        {children}
      </p>
    </section>
  );
}
