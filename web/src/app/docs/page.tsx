"use client";

import { type CSSProperties, type FormEvent, type ReactNode, useState } from "react";
import { MarketingHeader, MarketingFooter } from "@/components/marketing-nav";

export default function DocsPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("PinCapture support request");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

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
      setStatus(`Ticket ${data.ticketId} created. A copy was sent to your email.`);
      setMessage("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not submit support ticket.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--page)", fontFamily: "var(--font-sans)", color: "var(--text)" }}>
      <MarketingHeader />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "34px 22px 64px" }}>
        <h1 style={{ color: "var(--text-strong)", fontSize: 28, margin: "0 0 8px" }}>PinCapture Docs</h1>
        <p style={{ color: "var(--text-muted)", margin: "0 0 26px", fontSize: 15 }}>
          Technical operating instructions for capturing, saving, exporting, archiving, and recovering PinCapture guides.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 0.8fr)", gap: 20, alignItems: "start" }}>
          <section style={panelStyle}>
            <DocSection title="1. Install or reload the Chrome extension">
              Open <code>chrome://extensions</code>, enable Developer Mode, and load the PinCapture extension folder. When testing a new build, click Reload on the PinCapture extension before capturing again.
            </DocSection>

            <DocSection title="2. Start a screenshot capture session">
              Open the webpage you want to document. Click the PinCapture extension icon. The side panel opens on the right side of Chrome. Enter a guide title, then click <strong>Start Capture Screenshots</strong>.
            </DocSection>

            <DocSection title="3. Capture screenshots correctly">
              Use the webpage normally to expand menus, open accordions, move between pages, or prepare the exact state you want. PinCapture does not capture when you click the webpage. To save a screenshot, click <strong>Capture screenshot</strong> in the right-side PinCapture panel. Each capture becomes a numbered slide.
            </DocSection>

            <DocSection title="4. Pause and resume without losing slides">
              Click <strong>Stop Screenshots</strong> to pause capture. Existing slides remain in the panel. Click <strong>Start Capture Screenshots</strong> again to continue adding slides to the same unsaved guide.
            </DocSection>

            <DocSection title="5. Save to the dashboard">
              When the guide is complete, click <strong>Finish and save to dashboard</strong>. PinCapture opens the importer and stores the guide under Dashboard. Saved cards show the number of steps and the last recorded date/time in 24-hour format.
            </DocSection>

            <DocSection title="6. Export files">
              Open a saved guide and export it as PDF, Word, PPTX, PPSX, or PPS. Screenshot exports are intentionally large and borderless so reviewers can read the page content.
            </DocSection>

            <DocSection title="7. Archive, trash, and recovery">
              Use the card action menu to move guides to Archive Folder or Trash. Archive keeps completed guides organized by month. Trash keeps deleted guides recoverable. Permanent Delete moves a guide into Deleted Records instead of removing the database rows, so an administrator can still locate it by date or file name.
            </DocSection>

            <DocSection title="8. Record and save video">
              Click <strong>Start video</strong> in the right-side panel, choose the tab, window, or screen to share, and click <strong>Stop video</strong> when finished. PinCapture optimizes recordings for a maximum of 10 minutes and uploads larger files in resumable chunks with progress shown in the panel. When the upload finishes, click <strong>Finish and save to dashboard</strong>. Use <strong>Download</strong> on a saved video card or beside an opened video to save the MP4 file to your computer.
            </DocSection>
          </section>

          <aside style={panelStyle}>
            <h2 style={{ color: "var(--text-strong)", fontSize: 20, margin: "0 0 8px" }}>Open a support ticket</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6, fontSize: 14, margin: "0 0 16px" }}>
              A ticket copy is sent to the requester and support@flowlog.dev.
            </p>
            <form onSubmit={submitTicket} style={{ display: "grid", gap: 10 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" type="email" required style={inputStyle} />
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" required style={inputStyle} />
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe the issue, page URL, guide name, and exact steps." required rows={7} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
              <button disabled={sending} style={buttonStyle}>
                {sending ? "Creating ticket..." : "Create support ticket"}
              </button>
            </form>
            {status && <p style={{ margin: "12px 0 0", color: status.includes("created") ? "var(--success)" : "var(--danger)", fontSize: 13, lineHeight: 1.5 }}>{status}</p>}
          </aside>
        </div>
      </div>

      <MarketingFooter />
    </main>
  );
}

function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h2 style={{ color: "var(--text-strong)", fontSize: 18, margin: "0 0 8px" }}>{title}</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.75, margin: 0 }}>{children}</p>
    </section>
  );
}

const panelStyle: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 24,
};

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--border-strong)",
  borderRadius: 7,
  padding: "10px 11px",
  font: "inherit",
  fontSize: 14,
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

