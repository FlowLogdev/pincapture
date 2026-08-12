import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function TermsPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--page)",
      color: "var(--text)",
      fontFamily: "var(--font-sans)",
    }}>
      <header style={{
        minHeight: 64,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "0 28px",
        flexWrap: "wrap",
      }}>
        <Link href="/" aria-label="PinCapture home" style={{ display: "block" }}>
          <BrandLogo size="app" />
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/refund" style={headerLinkStyle}>Refunds</Link>
          <Link href="/privacy" style={headerLinkStyle}>Privacy</Link>
          <Link href="/support" style={headerLinkStyle}>Support</Link>
          <Link href="/login" style={primaryHeaderLinkStyle}>Sign in</Link>
        </nav>
      </header>

      <section style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "58px 24px 76px",
      }}>
        <p style={eyebrowStyle}>Terms of Service</p>
        <h1 style={titleStyle}>PinCapture Terms of Service</h1>
        <p style={introStyle}>
          These terms govern your use of the PinCapture web dashboard at pincapturetool.com and the
          PinCapture Chrome extension. By creating an account or using PinCapture, you agree to these terms.
        </p>

        <div style={panelStyle}>
          <PolicySection title="1. The service">
            PinCapture lets you record your screen, capture annotated screenshots, and turn them into
            step-by-step guides you can export as PDF, Word, PowerPoint, or slideshow files. Some features
            require an active paid subscription.
          </PolicySection>

          <PolicySection title="2. Accounts">
            You must provide accurate information when creating an account and are responsible for
            safeguarding your password and any activity under your account. Tell us right away at
            support@flowlog.dev if you suspect unauthorized access.
          </PolicySection>

          <PolicySection title="3. Subscriptions and billing">
            PinCapture is offered on Solo and Team subscription plans, billed monthly or annually as shown
            on our <Link href="/pricing" style={inlineLinkStyle}>pricing page</Link>. Subscriptions renew
            automatically at the end of each billing period until canceled. You can cancel at any time from
            your billing settings — your access continues through the end of the period you already paid
            for, and you will not be charged again after cancellation.
          </PolicySection>

          <PolicySection title="4. Refunds">
            Full refunds are available within 7 days of your first payment. Requesting a refund cancels
            your subscription immediately. After the 7-day window, payments are non-refundable, though you
            may cancel future renewals at any time. See our full{" "}
            <Link href="/refund" style={inlineLinkStyle}>refund policy</Link>.
          </PolicySection>

          <PolicySection title="5. Acceptable use">
            You agree not to use PinCapture to capture, store, or share content you don't have the right to
            capture, to violate any law, to interfere with the service's operation, or to attempt to access
            accounts or data that aren't yours.
          </PolicySection>

          <PolicySection title="6. Your content">
            You retain ownership of the screenshots, recordings, and guides you create with PinCapture. You
            grant us a limited license to store, process, and display that content solely to operate the
            service for you — for example, saving guides, rendering exports, and displaying them in your
            dashboard. We don't use your content for any other purpose.
          </PolicySection>

          <PolicySection title="7. Intellectual property">
            PinCapture, its logo, and its software are owned by us and protected by intellectual property
            law. These terms don't grant you any rights to our trademarks, branding, or underlying code
            beyond what's needed to use the service as intended.
          </PolicySection>

          <PolicySection title="8. Third-party services">
            PinCapture relies on third-party providers to operate — including Stripe for payment
            processing and Supabase for authentication and data storage. Your use of PinCapture is also
            subject to those providers' own terms where applicable, particularly for payment information,
            which we never store directly.
          </PolicySection>

          <PolicySection title="9. Service availability">
            We aim to keep PinCapture available and reliable but don't guarantee uninterrupted access.
            PinCapture is provided "as is" without warranties of any kind, express or implied, including
            fitness for a particular purpose.
          </PolicySection>

          <PolicySection title="10. Limitation of liability">
            To the extent permitted by law, we are not liable for indirect, incidental, or consequential
            damages arising from your use of PinCapture. Our total liability for any claim is limited to
            the amount you paid us in the 12 months before the claim arose.
          </PolicySection>

          <PolicySection title="11. Termination">
            You may stop using PinCapture and cancel your subscription at any time. We may suspend or
            terminate accounts that violate these terms, including for abuse, non-payment, or unlawful use.
          </PolicySection>

          <PolicySection title="12. Changes to these terms">
            We may update these terms as PinCapture evolves or as legal requirements change. We'll update
            the effective date below when we do; continued use of PinCapture after a change means you
            accept the updated terms.
          </PolicySection>

          <PolicySection title="13. Contact">
            Questions about these terms? Reach us at support@flowlog.dev.
          </PolicySection>

          <p style={{ margin: "28px 0 0", color: "var(--text-faint)", fontSize: 13 }}>
            Effective date: August 12, 2026
          </p>
        </div>
      </section>

      <footer style={footerStyle}>
        © 2026 flowlog.dev. All rights reserved.
      </footer>
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
      <h2 style={{ margin: "0 0 7px", color: "var(--text-strong)", fontSize: 18 }}>
        {title}
      </h2>
      <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 15 }}>
        {children}
      </p>
    </section>
  );
}

const headerLinkStyle = {
  color: "var(--text-muted)",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 700,
  padding: "8px 12px",
};

const primaryHeaderLinkStyle = {
  color: "var(--on-accent)",
  background: "var(--accent)",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 800,
  padding: "9px 14px",
  borderRadius: 7,
};

const inlineLinkStyle = {
  color: "var(--text-strong)",
  fontWeight: 700,
  textDecoration: "underline",
};

const eyebrowStyle = {
  margin: "0 0 8px",
  color: "var(--text-muted)",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase" as const,
  letterSpacing: 0,
};

const titleStyle = {
  margin: "0 0 18px",
  color: "var(--text-strong)",
  fontSize: 36,
  lineHeight: 1.15,
  letterSpacing: 0,
};

const introStyle = {
  margin: "0 0 24px",
  color: "var(--text-muted)",
  lineHeight: 1.7,
  fontSize: 16,
};

const panelStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 28,
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
};

const footerStyle = {
  padding: "0 24px 34px",
  textAlign: "center" as const,
  color: "var(--text-faint)",
  fontSize: 13,
};
