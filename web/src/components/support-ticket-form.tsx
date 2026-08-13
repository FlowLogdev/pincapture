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

export function SupportTicketForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("PinCapture support request");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<CreatedTicket | null>(null);

  async function submitTicket(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit support ticket.");
      setCreatedTicket(data.ticket);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit support ticket.");
    } finally {
      setSending(false);
    }
  }

  if (createdTicket) {
    return (
      <div>
        <div style={successBadgeStyle}>Ticket created</div>
        <h2 style={{ color: "var(--text-strong)", fontSize: 20, margin: "12px 0 10px" }}>
          Ticket information has been sent
        </h2>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.65, fontSize: 14, margin: "0 0 16px" }}>
          Your support request was sent to support@flowlog.dev. A copy was also sent to{" "}
          {createdTicket.requesterEmail}.
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
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <button onClick={() => setCreatedTicket(null)} style={buttonStyle}>
            Open another ticket
          </button>
          <Link href="/dashboard" style={secondaryButtonStyle}>Check ticket status</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={submitTicket} style={{ display: "grid", gap: 10 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" type="email" required style={inputStyle} />
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" required style={inputStyle} />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the issue, page URL, guide name, and exact steps."
          required
          rows={7}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
        />
        <button disabled={sending} style={buttonStyle}>
          {sending ? "Creating ticket..." : "Create support ticket"}
        </button>
      </form>
      {error && (
        <p style={{ margin: "12px 0 0", color: "var(--danger)", fontSize: 13, lineHeight: 1.5 }}>
          {error}
        </p>
      )}
    </>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--border-strong)",
  borderRadius: 7,
  padding: "10px 11px",
  font: "inherit",
  fontSize: 14,
  color: "var(--text)",
  boxSizing: "border-box",
};

const buttonStyle: CSSProperties = {
  background: "var(--text-strong)",
  color: "var(--surface)",
  border: 0,
  borderRadius: 7,
  padding: "11px 14px",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  background: "var(--surface)",
  color: "var(--text-strong)",
  border: "1px solid var(--border-strong)",
  borderRadius: 7,
  padding: "11px 14px",
  fontWeight: 800,
  textDecoration: "none",
  fontSize: 14,
};

const successBadgeStyle: CSSProperties = {
  display: "inline-flex",
  background: "var(--success-soft)",
  color: "var(--success)",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 800,
};

const ticketSummaryStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 12,
  background: "var(--page)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 14,
};

const summaryLabelStyle: CSSProperties = {
  display: "block",
  color: "var(--text-muted)",
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 4,
};

const summaryValueStyle: CSSProperties = {
  display: "block",
  color: "var(--text-strong)",
  fontSize: 14,
  lineHeight: 1.35,
};

const progressTrackStyle: CSSProperties = {
  height: 10,
  background: "var(--border)",
  borderRadius: 999,
  overflow: "hidden",
  marginTop: 14,
};

const progressFillStyle: CSSProperties = {
  height: "100%",
  background: "var(--success)",
  borderRadius: 999,
};
