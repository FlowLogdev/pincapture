import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function PrivacyPage() {
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
          <Link href="/terms" style={headerLinkStyle}>Terms</Link>
          <Link href="/refund" style={headerLinkStyle}>Refunds</Link>
          <Link href="/support" style={headerLinkStyle}>Support</Link>
          <Link href="/login" style={primaryHeaderLinkStyle}>Sign in</Link>
        </nav>
      </header>

      <section style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "58px 24px 76px",
      }}>
        <p style={eyebrowStyle}>Privacy Policy</p>
        <h1 style={titleStyle}>PinCapture Privacy Policy</h1>
        <p style={introStyle}>
          This privacy policy applies to the PinCapture Chrome extension and
          PinCapture web dashboard at pincapturetool.com.
        </p>

        <div style={panelStyle}>
          <PolicySection title="Single purpose">
            PinCapture is an internal documentation tool that lets authorized
            users capture screenshots and step details, save them as process
            guides, and export those guides as PDF, Word, and PowerPoint files.
            PinCapture only captures content after the user intentionally starts
            a capture session.
          </PolicySection>

          <PolicySection title="Data categories handled">
            PinCapture handles website content only when a user starts capture
            and saves or exports a guide. This can include screenshots, visible
            page text shown in screenshots, page URLs, clicked element labels,
            slide numbers, guide titles, timestamps, and step metadata needed to
            create the guide.
          </PolicySection>

          <PolicySection title="Account and support information">
            PinCapture may process account information needed to sign in and use
            the dashboard, such as email address and display name. If a user
            submits a support ticket, PinCapture stores the requester name,
            email address, subject, support details, ticket status, and support
            replies so the support team can respond.
          </PolicySection>

          <PolicySection title="Data we do not collect">
            PinCapture does not collect passwords, payment card data, health
            information, financial account information, authentication secrets,
            precise location, unrelated browsing history, or keystroke logs.
            PinCapture does not monitor websites outside an active capture
            session.
          </PolicySection>

          <PolicySection title="How data is used">
            Captured content is used only to create, display, save, edit, export,
            and support PinCapture process guides. Account and support data is
            used only to authenticate users, operate the dashboard, provide
            support, and maintain service security.
          </PolicySection>

          <PolicySection title="Chrome extension permissions">
            PinCapture requests permissions only to support its documentation
            workflow. activeTab, tabs, scripting, and host access are used to
            capture the current page after the user starts capture. storage is
            used to keep the in-progress capture and extension settings.
            downloads is used when the user exports a guide file. sidePanel is
            used to keep the capture controls and slide list visible on the
            right side of Chrome.
          </PolicySection>

          <PolicySection title="Local capture and saving">
            During a capture session, screenshots and step data remain in the
            browser extension until the user chooses to save the guide to the
            PinCapture dashboard or export a file. If the user clears the
            capture or removes the extension, unsaved local capture data may be
            deleted.
          </PolicySection>

          <PolicySection title="Sharing and transfer">
            PinCapture does not sell, rent, or transfer user data to third
            parties for advertising, marketing, profiling, analytics resale, or
            unrelated purposes. Saved guide content is available only to the
            authenticated user and authorized internal administrators needed to
            operate or support the service.
          </PolicySection>

          <PolicySection title="Limited Use disclosure">
            PinCapture&apos;s use and transfer of information received from
            Google APIs will adhere to the Chrome Web Store User Data Policy,
            including the Limited Use requirements. PinCapture does not use or
            transfer user data for purposes unrelated to its single purpose and
            does not use user data to determine creditworthiness or lending
            eligibility.
          </PolicySection>

          <PolicySection title="Security">
            PinCapture uses HTTPS for the public web dashboard and Chrome
            extension service endpoints. Access to saved guides and tickets is
            limited through authenticated sessions and database access controls.
          </PolicySection>

          <PolicySection title="Retention and deletion">
            Saved guides and support tickets are retained while the account or
            workspace needs them. Users can move guides to Trash, recover them,
            archive them, or mark them for deletion from the dashboard. To
            request deletion of account data, saved guide data, or support
            ticket data, contact support@flowlog.dev.
          </PolicySection>

          <PolicySection title="Children">
            PinCapture is intended for business and internal team use. It is not
            directed to children under 13, and we do not knowingly collect data
            from children under 13.
          </PolicySection>

          <PolicySection title="Changes">
            We may update this policy when PinCapture changes or when legal,
            security, or Chrome Web Store requirements change. The effective date
            below shows when this policy was last updated.
          </PolicySection>

          <PolicySection title="Contact">
            For privacy questions, data deletion requests, or Chrome Web Store
            privacy review questions, contact support@flowlog.dev.
          </PolicySection>

          <p style={{ margin: "28px 0 0", color: "var(--text-faint)", fontSize: 13 }}>
            Effective date: May 24, 2026
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
