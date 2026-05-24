"use client";

import { type CSSProperties, type FormEvent, useState } from "react";
import Link from "next/link";

type CreatedTicket = {
  ticketId: string;
  subject: string;
  requesterEmail: string;
  status: string;
  progress: number;
};

export default function SupportPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("PinCapture support request");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<CreatedTicket | null>(null);

  async function submitTicket(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setStatus("");

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit support ticket.");
      setCreatedTicket(data.ticket);
      setStatus("");
      setMessage("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not submit support ticket.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <Link href="/" style={brandStyle}>
          <img src="/pinvest-logo.svg" alt="Pinvest" style={{ height: 22, filter: "brightness(0) invert(1)" }} />
          <span style={pillStyle}>PinCapture</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/privacy" style={headerLinkStyle}>Privacy</Link>
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

        {createdTicket ? (
          <div style={panelStyle}>
            <div style={successBadgeStyle}>Ticket created</div>
            <h2 style={{ color: "#023465", fontSize: 24, margin: "12px 0 10px" }}>
              Ticket information has been sent
            </h2>
            <p style={{ color: "#475569", lineHeight: 1.7, fontSize: 15, margin: "0 0 18px" }}>
              Your support request was sent to support@flowlog.dev and fabio.almeida@pinvestcapital.com.
              A copy was also sent to {createdTicket.requesterEmail}.
            </p>
            <div style={ticketSummaryStyle}>
              <div>
                <span style={summaryLabelStyle}>Ticket number</span>
                <strong style={summaryValueStyle}>{createdTicket.ticketId}</strong>
              </div>
              <div>
                <span style={summaryLabelStyle}>Status</span>
                <strong style={summaryValueStyle}>Ticket submitted</strong>
              </div>
              <div>
                <span style={summaryLabelStyle}>Subject</span>
                <strong style={summaryValueStyle}>{createdTicket.subject}</strong>
              </div>
            </div>
            <div style={progressTrackStyle}>
              <div style={{ ...progressFillStyle, width: `${createdTicket.progress || 10}%` }} />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
              <button
                onClick={() => setCreatedTicket(null)}
                style={buttonStyle}
              >
                Open another ticket
              </button>
              <Link href="/dashboard" style={secondaryButtonStyle}>Check ticket status</Link>
            </div>
          </div>
        ) : (
        <div style={panelStyle}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ color: "#023465", fontSize: 20, margin: "0 0 8px" }}>Open a support ticket</h2>
            <p style={{ color: "#64748b", lineHeight: 1.65, fontSize: 14, margin: 0 }}>
              A ticket copy is sent to the requester, support@flowlog.dev, and fabio.almeida@pinvestcapital.com.
            </p>
          </div>

          <form onSubmit={submitTicket} style={{ display: "grid", gap: 12 }}>
            <label style={labelStyle}>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@company.com" type="email" required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Subject
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Details
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Include the guide name, page URL, what you clicked, what you expected, and any error message."
                required
                rows={8}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              />
            </label>
            <button disabled={sending} style={buttonStyle}>
              {sending ? "Creating ticket..." : "Create support ticket"}
            </button>
          </form>

          {status && (
            <p style={{
              margin: "14px 0 0",
              color: status.includes("created") ? "#166534" : "#dc2626",
              fontSize: 14,
              lineHeight: 1.5,
            }}>
              {status}
            </p>
          )}
        </div>
        )}
      </section>

      <footer style={footerStyle}>
        © 2026 flowlog.dev. All rights reserved.
      </footer>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f6f7fb",
  color: "#0f172a",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const headerStyle: CSSProperties = {
  height: 64,
  background: "#023465",
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

const pillStyle: CSSProperties = {
  background: "rgba(255,221,0,0.16)",
  color: "#ffdd00",
  borderRadius: 5,
  padding: "3px 9px",
  fontSize: 11,
  fontWeight: 800,
};

const headerLinkStyle: CSSProperties = {
  color: "rgba(255,255,255,0.78)",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 700,
  padding: "8px 12px",
};

const primaryHeaderLinkStyle: CSSProperties = {
  color: "#023465",
  background: "#ffdd00",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 800,
  padding: "9px 14px",
  borderRadius: 7,
};

const eyebrowStyle: CSSProperties = {
  margin: "0 0 8px",
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0,
};

const titleStyle: CSSProperties = {
  margin: "0 0 14px",
  color: "#023465",
  fontSize: 36,
  lineHeight: 1.15,
  letterSpacing: 0,
};

const introStyle: CSSProperties = {
  margin: "0 0 24px",
  color: "#475569",
  lineHeight: 1.7,
  fontSize: 16,
};

const panelStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #dbe3ef",
  borderRadius: 8,
  padding: 28,
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  color: "#023465",
  fontSize: 13,
  fontWeight: 800,
};

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 7,
  padding: "10px 11px",
  font: "inherit",
  fontSize: 14,
  color: "#0f172a",
};

const buttonStyle: CSSProperties = {
  background: "#023465",
  color: "#fff",
  border: 0,
  borderRadius: 7,
  padding: "12px 14px",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  background: "#fff",
  color: "#023465",
  border: "1px solid #cbd5e1",
  borderRadius: 7,
  padding: "12px 14px",
  fontWeight: 800,
  textDecoration: "none",
  fontSize: 14,
};

const successBadgeStyle: CSSProperties = {
  display: "inline-flex",
  background: "#dcfce7",
  color: "#166534",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 800,
};

const ticketSummaryStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: 16,
};

const summaryLabelStyle: CSSProperties = {
  display: "block",
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 4,
};

const summaryValueStyle: CSSProperties = {
  display: "block",
  color: "#023465",
  fontSize: 15,
  lineHeight: 1.35,
};

const progressTrackStyle: CSSProperties = {
  height: 12,
  background: "#e2e8f0",
  borderRadius: 999,
  overflow: "hidden",
  marginTop: 18,
};

const progressFillStyle: CSSProperties = {
  height: "100%",
  background: "#22c55e",
  borderRadius: 999,
};

const footerStyle: CSSProperties = {
  padding: "0 24px 34px",
  textAlign: "center",
  color: "#94a3b8",
  fontSize: 13,
};
