"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SupportTicketForm } from "@/components/support-ticket-form";

export default function SupportPage() {
  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <Link href="/" style={brandStyle}>
          <BrandLogo size="app" />
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/terms" style={headerLinkStyle}>Terms</Link>
          <Link href="/privacy" style={headerLinkStyle}>Privacy</Link>
          <Link href="/refund" style={headerLinkStyle}>Refunds</Link>
          <Link href="/login" style={primaryHeaderLinkStyle}>Sign in</Link>
        </nav>
      </header>

      <section style={{ maxWidth: 860, margin: "0 auto", padding: "58px 24px 76px" }}>
        <p style={eyebrowStyle}>Support</p>
        <h1 style={titleStyle}>PinCapture Support</h1>
        <p style={introStyle}>
          Submit a support ticket for install issues, Chrome Web Store access,
          capture problems, export issues, dashboard errors, or account questions.
        </p>

        <div style={panelStyle}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ color: "var(--text-strong)", fontSize: 20, margin: "0 0 8px" }}>Open a support ticket</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.65, fontSize: 14, margin: 0 }}>
              A ticket copy is sent to the requester and support@flowlog.dev.
            </p>
          </div>
          <SupportTicketForm />
        </div>
      </section>

      <footer style={footerStyle}>
        © 2026 flowlog.dev. All rights reserved.
      </footer>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "var(--page)",
  color: "var(--text)",
  fontFamily: "var(--font-sans)",
};

const headerStyle: CSSProperties = {
  height: 64,
  background: "var(--surface)",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 28px",
};

const brandStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  textDecoration: "none",
};

const headerLinkStyle: CSSProperties = {
  color: "var(--text-muted)",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 700,
  padding: "8px 12px",
};

const primaryHeaderLinkStyle: CSSProperties = {
  color: "var(--on-accent)",
  background: "var(--accent)",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 800,
  padding: "9px 14px",
  borderRadius: 7,
};

const eyebrowStyle: CSSProperties = {
  margin: "0 0 8px",
  color: "var(--text-muted)",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0,
};

const titleStyle: CSSProperties = {
  margin: "0 0 14px",
  color: "var(--text-strong)",
  fontSize: 36,
  lineHeight: 1.15,
  letterSpacing: 0,
};

const introStyle: CSSProperties = {
  margin: "0 0 24px",
  color: "var(--text-muted)",
  lineHeight: 1.7,
  fontSize: 16,
};

const panelStyle: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 28,
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
};

const footerStyle: CSSProperties = {
  padding: "0 24px 34px",
  textAlign: "center",
  color: "var(--text-faint)",
  fontSize: 13,
};
