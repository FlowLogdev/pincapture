"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { supabase, type Guide } from "@/lib/supabase";
import {
  AUDIO_BITS_PER_SECOND,
  formatFileSize,
  MAX_VIDEO_DURATION_MS,
  RESUMABLE_UPLOAD_THRESHOLD_BYTES,
  uploadBlobResumable,
  VIDEO_BITS_PER_SECOND,
} from "@/lib/resumable-upload";
import {
  selectMp4RecordingMimeType,
  videoDownloadFileName,
  videoDownloadUrl,
} from "@/lib/video-download";

type GuideViewMode = "active" | "videos" | "archived" | "trashed" | "deleted";
type ViewMode = GuideViewMode | "tickets" | "adminTickets";
type TicketStatus = "submitted" | "review" | "working" | "updated" | "closed";
type CaptureMode = "screenshots" | "video";

type TicketMessage = {
  author: "customer" | "admin" | "system";
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

type Ticket = {
  id: string;
  ticketId: string;
  requesterName: string;
  requesterEmail: string;
  subject: string;
  status: TicketStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
};

const adminEmails = ["support@flowlog.dev"];

const viewLabels: Record<ViewMode, string> = {
  active: "Dashboard",
  videos: "Saved Videos",
  archived: "Archive Folder",
  trashed: "Trash",
  deleted: "Deleted Records",
  tickets: "Tickets",
  adminTickets: "All Customer Tickets",
};

const ticketLabels: Record<TicketStatus, string> = {
  submitted: "Ticket submitted",
  review: "Ticket is in review",
  working: "Ticket is being worked on",
  updated: "Ticket has been updated",
  closed: "Ticket has been closed",
};

export default function DashboardPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [greeting, setGreeting] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState<ViewMode>("active");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [ticketDrafts, setTicketDrafts] = useState<Record<string, string>>({});
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, TicketStatus>>({});
  const [captureMode, setCaptureMode] = useState<CaptureMode | null>(null);

  const isAdmin = adminEmails.includes(userEmail.toLowerCase());

  useEffect(() => {
    loadUser();
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    if (view === "tickets" || view === "adminTickets") {
      loadTickets(isAdmin || view === "adminTickets" ? "all" : "mine");
    } else {
      loadGuides(view);
    }
  }, [view, isAdmin]);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserName(user.user_metadata?.full_name || user.email || "");
      setUserEmail(user.email || "");
    }
  }

  async function loadGuides(nextView: GuideViewMode) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/guides?status=${nextView}`);
    if (!res.ok) {
      setGuides([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setGuides(data.guides ?? []);
    setLoading(false);
  }

  async function loadTickets(scope: "mine" | "all") {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/support/tickets?scope=${scope}`);
    const data = await res.json();
    if (!res.ok) {
      setTickets([]);
      setError(data.error || "Could not load support tickets.");
      setLoading(false);
      return;
    }
    const nextTickets = data.tickets ?? [];
    setTickets(nextTickets);
    setTicketStatuses(Object.fromEntries(nextTickets.map((ticket: Ticket) => [ticket.ticketId, ticket.status])));
    setLoading(false);
  }

  async function createGuide() {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/guides", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create guide.");
      window.location.href = `/guide/${data.guide.id}`;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not create guide.");
      setCreating(false);
    }
  }

  async function updateGuide(id: string, action: "archive" | "restore" | "trash" | "recover" | "permanentDelete") {
    setOpenMenuId(null);
    const res = await fetch(`/api/guides/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not update guide.");
      return;
    }
    setGuides((prev) => prev.filter((guide) => guide.id !== id));
  }

  async function updateTicket(ticket: Ticket) {
    setError("");
    const res = await fetch("/api/support/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticketId: ticket.ticketId,
        status: ticketStatuses[ticket.ticketId] || ticket.status,
        message: ticketDrafts[ticket.ticketId] || "",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not update ticket.");
      return;
    }
    setTickets((prev) => prev.map((item) => item.ticketId === ticket.ticketId ? data.ticket : item));
    setTicketDrafts((prev) => ({ ...prev, [ticket.ticketId]: "" }));
    setTicketStatuses((prev) => ({ ...prev, [ticket.ticketId]: data.ticket.status }));
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const groupedGuides = useMemo(() => {
    return guides.reduce<Record<string, Guide[]>>((groups, guide) => {
      const key = guide.state_month || guide.archive_month || "Unsorted";
      groups[key] = groups[key] || [];
      groups[key].push(guide);
      return groups;
    }, {});
  }, [guides]);

  const visibleTabs = (["active", "videos", "archived", "trashed", "deleted", "tickets"] as ViewMode[])
    .concat(isAdmin ? ["adminTickets"] : []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--page)", fontFamily: "var(--font-sans)" }}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/" aria-label="PinCapture home" style={{ display: "block" }}>
            <BrandLogo size="app" />
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {userEmail && (
            <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>
              {greeting}, {firstNameFromUser(userName, userEmail)}
            </span>
          )}
          <Link href="/docs" style={docsButtonStyle}>DOCS</Link>
          <button onClick={createGuide} disabled={creating} style={newGuideStyle}>
            {creating ? "Creating..." : "+ New guide"}
          </button>
          <button onClick={signOut} style={signOutStyle}>Sign out</button>
        </div>
      </header>

      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "36px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-strong)" }}>{viewLabels[view]}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button onClick={() => setCaptureMode("screenshots")} style={captureActionStyle}>
              Capture screenshot
            </button>
            <button onClick={() => setCaptureMode("video")} style={captureSecondaryActionStyle}>
              Capture a video
            </button>
          </div>
        </div>

        <nav aria-label="Dashboard views" style={{ ...tabsStyle, marginBottom: 24 }}>
          {visibleTabs.map((mode) => (
            <button key={mode} onClick={() => setView(mode)} style={tabButtonStyle(view === mode)}>
              {viewLabels[mode]}
            </button>
          ))}
        </nav>

        {loading && <p style={{ color: "var(--text-muted)" }}>Loading...</p>}

        {error && <div style={errorStyle}>{error}</div>}

        {!loading && (view === "tickets" || view === "adminTickets") && (
          <TicketList
            tickets={tickets}
            admin={view === "adminTickets" && isAdmin}
            drafts={ticketDrafts}
            statuses={ticketStatuses}
            onDraft={(ticketId, value) => setTicketDrafts((prev) => ({ ...prev, [ticketId]: value }))}
            onStatus={(ticketId, value) => setTicketStatuses((prev) => ({ ...prev, [ticketId]: value }))}
            onUpdate={updateTicket}
          />
        )}

        {!loading && view !== "tickets" && view !== "adminTickets" && guides.length === 0 && (
          <EmptyState view={view} onCreate={createGuide} />
        )}

        {(view === "active" || view === "videos") && guides.length > 0 && (
          <div style={gridStyle}>
            {guides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                view={view === "videos" ? "active" : view}
                menuOpen={openMenuId === guide.id}
                onMenu={() => setOpenMenuId(openMenuId === guide.id ? null : guide.id)}
                onAction={updateGuide}
              />
            ))}
          </div>
        )}

        {view !== "active" && view !== "videos" && view !== "tickets" && view !== "adminTickets" && Object.entries(groupedGuides).map(([month, monthGuides]) => (
          <section key={month} style={{ marginBottom: 30 }}>
            <h2 style={{ color: "var(--text-strong)", fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
              {monthLabel(month)}
            </h2>
            <div style={gridStyle}>
              {monthGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  view={view}
                  menuOpen={openMenuId === guide.id}
                  onMenu={() => setOpenMenuId(openMenuId === guide.id ? null : guide.id)}
                  onAction={updateGuide}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {captureMode && (
        <DashboardCapturePanel
          mode={captureMode}
          onClose={() => setCaptureMode(null)}
        />
      )}
    </div>
  );
}

type DashboardCaptureStep = {
  stepNumber: number;
  title: string;
  description: string;
  type: "screenshot" | "video";
  screenshotDataUrl?: string;
  annotatedScreenshotDataUrl?: string;
  videoDataUrl?: string;
  url?: string;
};

function DashboardCapturePanel({ mode, onClose }: { mode: CaptureMode; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [title, setTitle] = useState(mode === "video" ? "Dashboard video capture" : "Dashboard screenshot capture");
  const [steps, setSteps] = useState<DashboardCaptureStep[]>([]);
  const [recording, setRecording] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Choose a screen, window, or browser tab to begin.");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => stopStream();
  }, []);

  async function startSharing() {
    setError("");
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError("Screen capture is not available in this browser.");
      return;
    }

    try {
      stopStream();
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: mode === "video"
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 15, max: 15 },
            }
          : true,
        audio: mode === "video",
      });
      streamRef.current = stream;
      setSharing(true);
      setStatus(mode === "video" ? "Ready to record video." : "Ready to capture screenshots.");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setSharing(false);
        setRecording(false);
        setStatus("Screen sharing stopped.");
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start screen capture.");
    }
  }

  function stopStream() {
    clearRecordingTimeout();
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setSharing(false);
    setRecording(false);
  }

  function clearRecordingTimeout() {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  }

  function captureScreenshot() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setError("Start screen sharing before capturing a screenshot.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    const stepNumber = steps.length + 1;
    setSteps((prev) => [
      ...prev,
      {
        stepNumber,
        title: `Screenshot ${stepNumber}`,
        description: `Captured from dashboard screen share`,
        type: "screenshot",
        screenshotDataUrl: dataUrl,
        annotatedScreenshotDataUrl: dataUrl,
        url: window.location.href,
      },
    ]);
    setStatus(`Captured screenshot ${stepNumber}.`);
    setError("");
  }

  function startVideoRecording() {
    const stream = streamRef.current;
    if (!stream) {
      setError("Start screen sharing before recording video.");
      return;
    }

    chunksRef.current = [];
    const includeAudio = stream.getAudioTracks().length > 0;
    const mimeType = selectMp4RecordingMimeType(
      MediaRecorder.isTypeSupported.bind(MediaRecorder),
      includeAudio
    );
    if (!mimeType) {
      setError("This browser cannot record MP4 video. Update Chrome and try again.");
      return;
    }
    const recorderOptions: MediaRecorderOptions = {
      mimeType,
      videoBitsPerSecond: VIDEO_BITS_PER_SECOND,
    };
    if (includeAudio) {
      recorderOptions.audioBitsPerSecond = AUDIO_BITS_PER_SECOND;
    }
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, recorderOptions);
    } catch {
      setError("MP4 recording could not start. Update Chrome and try again.");
      return;
    }
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = async () => {
      clearRecordingTimeout();
      try {
        setStatus("Uploading video recording...");
        const blob = new Blob(chunksRef.current, { type: "video/mp4" });
        const publicUrl = await uploadCaptureBlob(
          blob,
          `${safeFileName(title)}.mp4`,
          "video/mp4",
          (uploadedBytes, totalBytes) => {
            const percent = Math.round((uploadedBytes / totalBytes) * 100);
            setStatus(`Uploading video recording... ${percent}%`);
          }
        );
        setSteps([{
          stepNumber: 1,
          title: title.trim() || "Dashboard video capture",
          description: "Recorded from dashboard screen share",
          type: "video",
          videoDataUrl: publicUrl,
          url: window.location.href,
        }]);
        setStatus("Video recording uploaded and is ready to save.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not upload video recording.");
        setStatus("Video recording stopped, but upload failed.");
      } finally {
        setRecording(false);
      }
    };
    recorder.start(1000);
    recordingTimeoutRef.current = setTimeout(() => {
      if (recorder.state === "recording") {
        setStatus("10-minute recording limit reached. Preparing upload...");
        recorder.stop();
      }
    }, MAX_VIDEO_DURATION_MS);
    setRecording(true);
    setStatus("Recording video... Maximum length is 10 minutes.");
    setError("");
  }

  function stopVideoRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  async function saveCapture() {
    if (!steps.length) {
      setError(mode === "video" ? "Record a video before saving." : "Capture at least one screenshot before saving.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/guides/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() || "Untitled Guide", steps }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save capture.");
      stopStream();
      window.location.href = `/guide/${data.guide.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save capture.");
      setSaving(false);
    }
  }

  return (
    <aside style={capturePanelStyle}>
      <div style={capturePanelHeaderStyle}>
        <div>
          <div style={{ color: "var(--text-strong)", fontSize: 18, fontWeight: 900 }}>PinCapture</div>
          <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700 }}>
            {mode === "video" ? "Video capture" : "Screenshot capture"}
          </div>
        </div>
        <button onClick={() => { stopStream(); onClose(); }} style={captureCloseStyle} aria-label="Close capture panel">x</button>
      </div>

      <div style={{ padding: 14, display: "grid", gap: 12 }}>
        <label style={captureLabelStyle}>
          Guide title
          <input value={title} onChange={(event) => setTitle(event.target.value)} style={captureInputStyle} />
        </label>

        <video ref={videoRef} muted playsInline style={capturePreviewStyle} />

        <button onClick={startSharing} style={capturePrimaryButtonStyle}>
          {sharing ? "Change screen source" : "Choose screen to capture"}
        </button>

        {mode === "screenshots" ? (
          <button onClick={captureScreenshot} disabled={!sharing} style={capturePrimaryButtonStyle}>
            Capture screenshot
          </button>
        ) : (
          <>
            <button
              onClick={recording ? stopVideoRecording : startVideoRecording}
              disabled={!sharing}
              style={recording ? captureDangerButtonStyle : capturePrimaryButtonStyle}
            >
              {recording ? "Stop video" : "Start video"}
            </button>
            <div style={captureStatusStyle}>Optimized for reliable recordings up to 10 minutes.</div>
          </>
        )}

        {error && <div style={captureErrorStyle}>{error}</div>}
        <div style={captureStatusStyle}>{status}</div>

        <div style={captureListHeaderStyle}>
          <span>{mode === "video" ? "Video capture" : "Screen captures"}</span>
          <span>{steps.length} {steps.length === 1 ? "item" : "items"}</span>
        </div>

        <div style={captureListStyle}>
          {steps.length === 0 ? (
            <div style={captureEmptyStyle}>
              {mode === "video"
                ? "Choose a screen, start video, then stop when the recording is complete."
                : "Choose a screen, prepare the page, then click Capture screenshot for each numbered slide."}
            </div>
          ) : steps.map((step) => (
            <div key={step.stepNumber} style={captureItemStyle}>
              <div style={captureItemNumberStyle}>{step.stepNumber}</div>
              {step.type === "video" ? (
                <video src={step.videoDataUrl} controls style={captureThumbStyle} />
              ) : (
                <img src={step.screenshotDataUrl} alt={step.title} style={captureThumbStyle} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "var(--text-strong)", fontSize: 13, fontWeight: 900 }}>{step.title}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{step.type}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={saveCapture} disabled={saving || !steps.length || recording} style={captureSaveButtonStyle}>
          {saving ? "Saving..." : "Finish and save to dashboard"}
        </button>
      </div>
    </aside>
  );
}

function TicketList({
  tickets,
  admin,
  drafts,
  statuses,
  onDraft,
  onStatus,
  onUpdate,
}: {
  tickets: Ticket[];
  admin: boolean;
  drafts: Record<string, string>;
  statuses: Record<string, TicketStatus>;
  onDraft: (ticketId: string, value: string) => void;
  onStatus: (ticketId: string, value: TicketStatus) => void;
  onUpdate: (ticket: Ticket) => void;
}) {
  if (tickets.length === 0) {
    return (
      <div style={emptyStyle}>
        No support tickets yet.
        <br /><br />
        <Link href="/support" style={emptyLinkStyle}>Open a support ticket</Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {tickets.map((ticket) => (
        <article key={ticket.ticketId} style={ticketCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 800 }}>{ticket.ticketId}</div>
              <h2 style={{ margin: "4px 0 6px", color: "var(--text-strong)", fontSize: 18 }}>{ticket.subject}</h2>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>
                {admin ? `${ticket.requesterName} <${ticket.requesterEmail}>` : "Support team updates will appear here."}
              </p>
            </div>
            <span style={statusPillStyle(ticket.status)}>{ticketLabels[ticket.status]}</span>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: 12, fontWeight: 800 }}>
              <span>Progress</span>
              <span>{ticket.progress}%</span>
            </div>
            <div style={progressTrackStyle}>
              <div style={{ ...progressFillStyle, width: `${ticket.progress}%` }} />
            </div>
          </div>

          <div style={messageListStyle}>
            {ticket.messages.map((message, index) => (
              <div key={`${ticket.ticketId}-${index}`} style={messageStyle(message.author)}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 800, marginBottom: 4 }}>
                  {message.author === "admin" ? "Support" : message.author === "system" ? "System" : message.name}
                  {" "}· {formatRecordedAt(message.createdAt)}
                </div>
                <div style={{ color: "var(--text)", fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{message.message}</div>
              </div>
            ))}
          </div>

          {admin && (
            <div style={adminPanelStyle}>
              <label style={adminLabelStyle}>
                Ticket status
                <select
                  value={statuses[ticket.ticketId] || ticket.status}
                  onChange={(event) => onStatus(ticket.ticketId, event.target.value as TicketStatus)}
                  style={selectStyle}
                >
                  <option value="review">Ticket is in review</option>
                  <option value="working">Ticket is being worked on</option>
                  <option value="updated">Ticket has been updated</option>
                  <option value="closed">Ticket has been closed</option>
                </select>
              </label>
              <label style={adminLabelStyle}>
                Reply to customer
                <textarea
                  value={drafts[ticket.ticketId] || ""}
                  onChange={(event) => onDraft(ticket.ticketId, event.target.value)}
                  rows={4}
                  placeholder="Write the customer update. They will receive this by email."
                  style={textareaStyle}
                />
              </label>
              <button onClick={() => onUpdate(ticket)} style={ticketButtonStyle}>Send ticket update</button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function GuideCard({
  guide,
  view,
  menuOpen,
  onMenu,
  onAction,
}: {
  guide: Guide;
  view: GuideViewMode;
  menuOpen: boolean;
  onMenu: () => void;
  onAction: (id: string, action: "archive" | "restore" | "trash" | "recover" | "permanentDelete") => void;
}) {
  const downloadName = videoDownloadFileName(guide.title, undefined, guide.video_download_url || undefined);
  const downloadUrl = guide.video_download_url
    ? videoDownloadUrl(guide.video_download_url, downloadName)
    : null;

  return (
    <div style={cardStyle}>
      <button onClick={onMenu} aria-label="Guide actions" style={cardMenuButtonStyle}>...</button>
      {menuOpen && (
        <div style={menuStyle}>
          {view === "active" && (
            <>
              <button onClick={() => onAction(guide.id, "archive")} style={menuButtonStyle("var(--text-strong)")}>Archive</button>
              <button onClick={() => onAction(guide.id, "trash")} style={menuButtonStyle("var(--danger)")}>Move to Trash</button>
            </>
          )}
          {view === "archived" && (
            <>
              <button onClick={() => onAction(guide.id, "restore")} style={menuButtonStyle("var(--text-strong)")}>Restore</button>
              <button onClick={() => onAction(guide.id, "trash")} style={menuButtonStyle("var(--danger)")}>Move to Trash</button>
            </>
          )}
          {view === "trashed" && (
            <>
              <button onClick={() => onAction(guide.id, "recover")} style={menuButtonStyle("var(--text-strong)")}>Recover</button>
              <button onClick={() => onAction(guide.id, "archive")} style={menuButtonStyle("var(--text-strong)")}>Archive</button>
              <button onClick={() => onAction(guide.id, "permanentDelete")} style={menuButtonStyle("var(--danger)")}>Permanent Delete</button>
            </>
          )}
          {view === "deleted" && (
            <button onClick={() => onAction(guide.id, "recover")} style={menuButtonStyle("var(--text-strong)")}>Recover</button>
          )}
        </div>
      )}

      <div style={guide.has_video ? videoCardThumbStyle : cardThumbStyle}>
        {guide.has_video ? "Video" : "Guide"}
      </div>
      <div style={{ padding: "12px 16px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-strong)" }}>{guide.title}</div>
          {guide.has_video && (
            <span style={videoPillStyle}>
              {guide.video_count || 1} video{(guide.video_count || 1) !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.55 }}>
          {guide.step_count} step{guide.step_count !== 1 ? "s" : ""}
          <br />
          Last recorded: {formatRecordedAt(guide.last_recorded_at || guide.updated_at)}
        </div>
      </div>
      <div style={cardActionsStyle}>
        <Link href={`/guide/${guide.id}`} style={openButtonStyle}>Open</Link>
        {guide.has_video && downloadUrl && (
          <a href={downloadUrl} download={downloadName} style={downloadButtonStyle}>
            Download
          </a>
        )}
      </div>
    </div>
  );
}

function EmptyState({ view, onCreate }: { view: GuideViewMode; onCreate: () => void }) {
  const text: Record<GuideViewMode, string> = {
    active: "No guides yet.",
    videos: "No saved videos yet.",
    archived: "No archived guides yet.",
    trashed: "Trash is empty.",
    deleted: "No deleted records yet.",
  };

  return (
    <div style={emptyStyle}>
      {text[view]}
      {view === "active" && (
        <>
          <br />
          Install the Chrome extension, record a process, then save it here.
          <br /><br />
          <button onClick={onCreate} style={emptyButtonStyle}>+ Create blank guide</button>
        </>
      )}
    </div>
  );
}

function formatRecordedAt(value?: string) {
  if (!value) return "Not recorded yet";
  const date = new Date(value);
  const datePart = date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  const timePart = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${datePart} ${timePart}`;
}

function monthLabel(value?: string | null) {
  if (!value || value === "Unsorted") return "Unsorted";
  return new Date(`${value}-01T00:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function firstNameFromUser(name: string, email: string) {
  const source = name?.trim() || email.split("@")[0] || "there";
  const first = source.split(/[.\s_-]+/).filter(Boolean)[0] || source;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

async function uploadCaptureBlob(
  blob: Blob,
  fileName: string,
  contentType: string,
  onProgress?: (uploadedBytes: number, totalBytes: number) => void
) {
  const res = await fetch("/api/uploads/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, contentType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not prepare video upload.");

  if (data.maxFileSizeBytes && blob.size > data.maxFileSizeBytes) {
    throw new Error(
      `The recording is ${formatFileSize(blob.size)}, above the ${formatFileSize(data.maxFileSizeBytes)} upload limit.`
    );
  }

  if (blob.size > RESUMABLE_UPLOAD_THRESHOLD_BYTES) {
    if (!data.resumableUrl) throw new Error("The server did not provide a resumable upload URL.");
    await uploadBlobResumable({
      endpoint: data.resumableUrl,
      blob,
      token: data.token,
      bucketName: data.bucket,
      objectName: data.path,
      contentType,
      onProgress,
    });
    return data.publicUrl as string;
  }

  const { error } = await supabase.storage
    .from(data.bucket)
    .uploadToSignedUrl(data.path, data.token, blob, {
      contentType,
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw new Error(error.message || "Could not upload video.");
  return data.publicUrl as string;
}

function safeFileName(value: string) {
  return (value || "pincapture-video")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "pincapture-video";
}

const headerStyle: CSSProperties = {
  background: "var(--surface)",
  borderBottom: "1px solid var(--border)",
  padding: "0 28px",
  minHeight: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const docsButtonStyle: CSSProperties = {
  background: "var(--surface-2)",
  color: "var(--text-strong)",
  textDecoration: "none",
  borderRadius: 7,
  padding: "7px 13px",
  fontWeight: 800,
  fontSize: 13,
};

const newGuideStyle: CSSProperties = {
  background: "var(--accent)",
  color: "var(--on-accent)",
  border: "none",
  borderRadius: 7,
  padding: "7px 16px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

const captureActionStyle: CSSProperties = {
  background: "var(--text-strong)",
  color: "var(--surface)",
  border: "none",
  borderRadius: 7,
  padding: "9px 14px",
  fontWeight: 800,
  fontSize: 13,
  cursor: "pointer",
};

const captureSecondaryActionStyle: CSSProperties = {
  background: "var(--surface)",
  color: "var(--text-strong)",
  border: "1px solid var(--border-strong)",
  borderRadius: 7,
  padding: "8px 14px",
  fontWeight: 800,
  fontSize: 13,
  cursor: "pointer",
};

const capturePanelStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  zIndex: 40,
  width: "min(430px, 100vw)",
  background: "var(--surface)",
  borderLeft: "1px solid var(--border-strong)",
  boxShadow: "-16px 0 38px rgba(15,23,42,0.2)",
  overflowY: "auto",
};

const capturePanelHeaderStyle: CSSProperties = {
  background: "var(--surface)",
  borderBottom: "1px solid var(--border)",
  padding: "16px 18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const captureCloseStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 6,
  border: "1px solid var(--border-strong)",
  background: "var(--surface-2)",
  color: "var(--text-strong)",
  fontSize: 18,
  fontWeight: 800,
  cursor: "pointer",
};

const captureLabelStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  color: "var(--text-strong)",
  fontSize: 12,
  fontWeight: 900,
};

const captureInputStyle: CSSProperties = {
  border: "1px solid var(--border-strong)",
  borderRadius: 7,
  padding: "10px 11px",
  color: "var(--text)",
  font: "inherit",
  fontSize: 14,
};

const capturePreviewStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 10",
  background: "var(--text)",
  border: "1px solid var(--border-strong)",
  borderRadius: 8,
  objectFit: "contain",
};

const capturePrimaryButtonStyle: CSSProperties = {
  background: "var(--text-strong)",
  color: "var(--surface)",
  border: "none",
  borderRadius: 7,
  padding: "11px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const captureDangerButtonStyle: CSSProperties = {
  ...capturePrimaryButtonStyle,
  background: "var(--danger)",
};

const captureSaveButtonStyle: CSSProperties = {
  background: "var(--accent)",
  color: "var(--on-accent)",
  border: "none",
  borderRadius: 7,
  padding: "12px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const captureStatusStyle: CSSProperties = {
  background: "var(--accent-soft)",
  border: "1px solid var(--border-strong)",
  color: "var(--accent-hover)",
  borderRadius: 7,
  padding: "9px 10px",
  fontSize: 12,
  lineHeight: 1.45,
};

const captureErrorStyle: CSSProperties = {
  background: "var(--danger-soft)",
  border: "1px solid var(--danger)",
  color: "var(--danger)",
  borderRadius: 7,
  padding: "9px 10px",
  fontSize: 12,
  lineHeight: 1.45,
};

const captureListHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "var(--text-strong)",
  fontSize: 13,
  fontWeight: 900,
};

const captureListStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  maxHeight: 320,
  overflowY: "auto",
};

const captureEmptyStyle: CSSProperties = {
  border: "1px dashed var(--border-strong)",
  borderRadius: 8,
  padding: "24px 16px",
  color: "var(--text-muted)",
  textAlign: "center",
  fontSize: 12,
  lineHeight: 1.6,
};

const captureItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 8,
};

const captureItemNumberStyle: CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 999,
  background: "var(--text-strong)",
  color: "var(--surface)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 900,
};

const captureThumbStyle: CSSProperties = {
  width: 96,
  height: 58,
  objectFit: "cover",
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--text)",
};

const signOutStyle: CSSProperties = {
  background: "none",
  color: "var(--text-muted)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 12,
  cursor: "pointer",
};

const tabsStyle: CSSProperties = {
  display: "flex",
  border: "1px solid var(--border)",
  borderRadius: 8,
  overflow: "hidden",
  background: "var(--surface)",
  flexWrap: "wrap",
};

function tabButtonStyle(active: boolean): CSSProperties {
  return {
    border: 0,
    padding: "8px 13px",
    cursor: "pointer",
    background: active ? "var(--surface-inverse)" : "var(--surface)",
    color: active ? "var(--text-inverse)" : "var(--text-strong)",
    fontWeight: 700,
    fontSize: 13,
  };
}

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 18,
};

const ticketCardStyle: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 18,
  boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
};

function statusPillStyle(status: TicketStatus): CSSProperties {
  const closed = status === "closed";
  return {
    alignSelf: "flex-start",
    background: closed ? "var(--success-soft)" : "var(--accent-soft)",
    color: closed ? "var(--success)" : "var(--accent-hover)",
    borderRadius: 999,
    padding: "7px 11px",
    fontSize: 12,
    fontWeight: 800,
  };
}

const progressTrackStyle: CSSProperties = {
  height: 12,
  background: "var(--border)",
  borderRadius: 999,
  overflow: "hidden",
  marginTop: 7,
};

const progressFillStyle: CSSProperties = {
  height: "100%",
  background: "var(--success)",
  borderRadius: 999,
};

const messageListStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 16,
};

function messageStyle(author: TicketMessage["author"]): CSSProperties {
  return {
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: 12,
    background: author === "admin" ? "var(--accent-soft)" : author === "system" ? "var(--surface)" : "var(--surface)",
  };
}

const adminPanelStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 16,
  padding: 14,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
};

const adminLabelStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  color: "var(--text-strong)",
  fontSize: 13,
  fontWeight: 800,
};

const selectStyle: CSSProperties = {
  border: "1px solid var(--border-strong)",
  borderRadius: 7,
  padding: "10px 11px",
  font: "inherit",
  color: "var(--text)",
};

const textareaStyle: CSSProperties = {
  border: "1px solid var(--border-strong)",
  borderRadius: 7,
  padding: "10px 11px",
  font: "inherit",
  color: "var(--text)",
  resize: "vertical",
  lineHeight: 1.5,
};

const ticketButtonStyle: CSSProperties = {
  background: "var(--text-strong)",
  color: "var(--surface)",
  border: "none",
  borderRadius: 7,
  padding: "10px 14px",
  fontWeight: 800,
  cursor: "pointer",
};

const cardStyle: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  position: "relative",
};

const cardMenuButtonStyle: CSSProperties = {
  position: "absolute",
  right: 10,
  top: 10,
  width: 30,
  height: 30,
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text-strong)",
  fontSize: 18,
  fontWeight: 800,
  cursor: "pointer",
  lineHeight: 1,
};

const menuStyle: CSSProperties = {
  position: "absolute",
  right: 10,
  top: 44,
  zIndex: 2,
  width: 170,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 7,
  boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
  padding: 6,
};

function menuButtonStyle(color: string): CSSProperties {
  return {
    width: "100%",
    textAlign: "left",
    border: 0,
    background: "transparent",
    color,
    padding: "8px 9px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}

const cardThumbStyle: CSSProperties = {
  height: 120,
  background: "var(--surface-2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text-strong)",
  fontSize: 15,
  fontWeight: 800,
};

const videoCardThumbStyle: CSSProperties = {
  ...cardThumbStyle,
  background: "var(--surface-3)",
  color: "var(--text-strong)",
  fontSize: 16,
};

const videoPillStyle: CSSProperties = {
  background: "var(--success-soft)",
  color: "var(--success)",
  borderRadius: 999,
  padding: "3px 8px",
  fontSize: 11,
  fontWeight: 900,
};

const openButtonStyle: CSSProperties = {
  display: "block",
  flex: 1,
  textAlign: "center",
  padding: "8px 0",
  background: "var(--text-strong)",
  color: "var(--surface)",
  borderRadius: 7,
  fontSize: 13,
  fontWeight: 700,
  textDecoration: "none",
};

const cardActionsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  padding: "10px 16px",
  borderTop: "1px solid var(--border)",
};

const downloadButtonStyle: CSSProperties = {
  ...openButtonStyle,
  background: "var(--accent)",
  color: "var(--on-accent)",
};

const errorStyle: CSSProperties = {
  background: "var(--danger-soft)",
  border: "1px solid var(--danger)",
  color: "var(--danger)",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 13,
  marginBottom: 18,
};

const emptyStyle: CSSProperties = {
  textAlign: "center",
  padding: "68px 0",
  color: "var(--text-faint)",
  fontSize: 14,
  lineHeight: 1.8,
};

const emptyButtonStyle: CSSProperties = {
  background: "var(--text-strong)",
  color: "var(--surface)",
  border: "none",
  borderRadius: 8,
  padding: "10px 22px",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};

const emptyLinkStyle: CSSProperties = {
  display: "inline-block",
  background: "var(--text-strong)",
  color: "var(--surface)",
  borderRadius: 8,
  padding: "10px 18px",
  fontWeight: 800,
  fontSize: 14,
  textDecoration: "none",
};
