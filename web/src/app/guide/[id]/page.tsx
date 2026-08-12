"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase, type Guide, type Step } from "@/lib/supabase";
import { videoDownloadFileName, videoDownloadUrl } from "@/lib/video-download";

type Params = { id: string };

export default function GuidePage({ params }: { params: Params }) {
  const { id } = params;

  const [guide, setGuide] = useState<Guide | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadGuide();
  }, [id]);

  async function loadGuide() {
    setLoading(true);
    const res = await fetch(`/api/guides/${id}`);
    if (!res.ok) {
      setGuide(null);
      setSteps([]);
      setSelectedStep(null);
      setLoading(false);
      return;
    }
    const { guide: g, steps: s } = await res.json();
    setGuide(g);
    setTitleDraft(g.title);
    setSteps(s ?? []);
    if (s && s.length > 0) setSelectedStep(s[0]);
    setLoading(false);
  }

  async function saveTitle() {
    if (!guide || titleDraft === guide.title) { setEditingTitle(false); return; }
    await supabase.from("guides").update({ title: titleDraft }).eq("id", id);
    setGuide({ ...guide, title: titleDraft });
    setEditingTitle(false);
  }

  async function updateStepTitle(step: Step, title: string) {
    await supabase.from("steps").update({ title }).eq("id", step.id);
    const updated = { ...step, title };
    setSteps((prev) => prev.map((s) => (s.id === step.id ? updated : s)));
    if (selectedStep?.id === step.id) setSelectedStep(updated);
  }

  async function deleteStep(stepId: string) {
    await supabase.from("steps").delete().eq("id", stepId);
    const remaining = steps
      .filter((s) => s.id !== stepId)
      .map((s, i) => ({ ...s, step_number: i + 1 }));
    for (const s of remaining) {
      await supabase.from("steps").update({ step_number: s.step_number }).eq("id", s.id);
    }
    setSteps(remaining);
    if (selectedStep?.id === stepId) {
      setSelectedStep(remaining[0] ?? null);
    }
  }

  async function exportGuide(format: "docx" | "pdf" | "pptx" | "ppsx" | "pps") {
    if (!guide || !steps.length) return;
    setExporting(format);
    try {
      const payload = {
        title: guide.title,
        steps: steps.map((s) => ({
          stepNumber: s.step_number,
          title: s.title,
          description: s.description ?? "",
          type: s.type,
          screenshotUrl: s.screenshot_url,
          annotatedScreenshotUrl: s.annotated_screenshot_url,
        })),
      };
      const res = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Export failed with status ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${guide.title.replace(/\s+/g, "_")}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <span style={{ color: "var(--text-muted)" }}>Loading…</span>
      </div>
    );
  }

  if (!guide) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <p>Guide not found.</p>
        <Link href="/">← Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--page)" }}>
      {/* Top bar */}
      <header
        className="guide-header"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 20px",
          minHeight: 60,
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexShrink: 0,
        }}
      >
        <Link href="/dashboard" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>
          ← Guides
        </Link>

        {editingTitle ? (
          <input
            ref={titleRef}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === "Enter" && saveTitle()}
            autoFocus
            style={{
              flex: 1,
              background: "var(--surface-2)",
              border: "1px solid var(--border-strong)",
              borderRadius: 5,
              color: "var(--text-strong)",
              padding: "4px 10px",
              fontSize: 15,
              fontWeight: 600,
              outline: "none",
            }}
          />
        ) : (
          <span
            onClick={() => setEditingTitle(true)}
            style={{
              flex: 1,
              color: "var(--text-strong)",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title="Click to rename"
          >
            {guide.title}
          </span>
        )}

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            onClick={() => exportGuide("docx")}
            disabled={!!exporting || !steps.length}
            style={exportBtnStyle}
          >
            {exporting === "docx" ? "…" : "Word"}
          </button>
          <button
            onClick={() => exportGuide("pdf")}
            disabled={!!exporting || !steps.length}
            style={exportBtnStyle}
          >
            {exporting === "pdf" ? "..." : "PDF"}
          </button>
          <button
            onClick={() => exportGuide("pptx")}
            disabled={!!exporting || !steps.length}
            style={exportBtnStyle}
          >
            {exporting === "pptx" ? "…" : "PPTX"}
          </button>
          <button
            onClick={() => exportGuide("ppsx")}
            disabled={!!exporting || !steps.length}
            style={exportBtnStyle}
          >
            {exporting === "ppsx" ? "..." : "PPSX"}
          </button>
          <button
            onClick={() => exportGuide("pps")}
            disabled={!!exporting || !steps.length}
            style={exportBtnStyle}
          >
            {exporting === "pps" ? "..." : "PPS"}
          </button>
        </div>
      </header>

      <div className="guide-workspace" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <aside
          className="guide-sidebar"
          style={{
            width: 220,
            background: "var(--surface)",
            borderRight: "1px solid var(--border)",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          {steps.length === 0 && (
            <p style={{ padding: 16, color: "var(--text-faint)", fontSize: 12, lineHeight: 1.7 }}>
              No steps yet.
              <br />
              Use the Chrome extension to record steps.
            </p>
          )}
          {steps.map((step) => (
            <div
              key={step.id}
              onClick={() => setSelectedStep(step)}
              style={{
                padding: "10px 12px",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                background: selectedStep?.id === step.id ? "var(--accent-soft)" : "transparent",
                borderLeft: selectedStep?.id === step.id ? "3px solid var(--accent)" : "3px solid transparent",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              {/* Thumbnail */}
              <div style={{ flexShrink: 0 }}>
                {step.type === "video" ? (
                  <div
                    style={{
                      width: 52, height: 34, borderRadius: 4, border: "1px solid var(--border)",
                      background: "var(--text-strong)", display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--surface)", fontSize: 10, fontWeight: 700,
                    }}
                  >
                    video
                  </div>
                ) : step.annotated_screenshot_url || step.screenshot_url ? (
                  <img
                    src={step.annotated_screenshot_url || step.screenshot_url!}
                    alt=""
                    style={{ width: 52, height: 34, objectFit: "cover", borderRadius: 4, border: "1px solid var(--border)" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 52, height: 34, borderRadius: 4, border: "1px solid var(--border)",
                      background: "var(--page)", display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--text-faint)", fontSize: 10,
                    }}
                  >
                    no img
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span
                    style={{
                      background: "var(--accent)", color: "var(--on-accent)", borderRadius: "50%",
                      width: 16, height: 16, fontSize: 9, fontWeight: 700,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                  >
                    {step.step_number}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {step.title}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>{step.type}</div>
              </div>
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main className="guide-content" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {!selectedStep ? (
            <div style={{ textAlign: "center", color: "var(--text-faint)", paddingTop: 80, fontSize: 14 }}>
              Select a step from the sidebar
            </div>
          ) : (
            <StepEditor
              step={selectedStep}
              guideTitle={guide.title}
              totalSteps={steps.length}
              onTitleSave={(title) => updateStepTitle(selectedStep, title)}
              onDelete={() => deleteStep(selectedStep.id)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

const exportBtnStyle: React.CSSProperties = {
  background: "var(--surface-2)",
  color: "var(--text-strong)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "5px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const videoDownloadButtonStyle: React.CSSProperties = {
  background: "var(--accent)",
  color: "var(--on-accent)",
  border: "1px solid var(--accent)",
  borderRadius: 6,
  padding: "5px 11px",
  fontSize: 12,
  fontWeight: 700,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

function StepEditor({
  step,
  guideTitle,
  totalSteps,
  onTitleSave,
  onDelete,
}: {
  step: Step;
  guideTitle: string;
  totalSteps: number;
  onTitleSave: (title: string) => void;
  onDelete: () => void;
}) {
  const [titleDraft, setTitleDraft] = useState(step.title);

  useEffect(() => {
    setTitleDraft(step.title);
  }, [step.id]);

  const mediaSrc = step.annotated_screenshot_url || step.screenshot_url;
  const isVideo = step.type === "video"
    || mediaSrc?.startsWith("data:video/")
    || /\.(?:mp4|webm)(?:$|[?#])/i.test(mediaSrc || "");
  const downloadName = videoDownloadFileName(guideTitle, step.step_number, mediaSrc || undefined);
  const downloadUrl = isVideo && mediaSrc
    ? videoDownloadUrl(mediaSrc, downloadName)
    : null;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Step header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span
          style={{
            background: "var(--accent)", color: "var(--on-accent)", borderRadius: "50%",
            width: 28, height: 28, fontSize: 13, fontWeight: 700,
            display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          {step.step_number}
        </span>
        <input
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={() => onTitleSave(titleDraft)}
          onKeyDown={(e) => e.key === "Enter" && onTitleSave(titleDraft)}
          style={{
            flex: 1, fontSize: 18, fontWeight: 600, border: "none", background: "transparent",
            outline: "none", color: "var(--text-strong)",
          }}
        />
        <span
          style={{
            background: "var(--accent-soft)", color: "var(--accent)", borderRadius: 5,
            padding: "2px 8px", fontSize: 11, fontWeight: 500,
          }}
        >
          {step.type}
        </span>
        {downloadUrl && (
          <a href={downloadUrl} download={downloadName} style={videoDownloadButtonStyle}>
            Download
          </a>
        )}
        <button
          onClick={onDelete}
          style={{
            border: "1px solid var(--danger)", background: "var(--surface)", color: "var(--danger)",
            borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>

      {step.description && (
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>{step.description}</p>
      )}

      {/* Media */}
      {isVideo && mediaSrc ? (
        <video
          src={mediaSrc}
          controls
          style={{
            width: "100%", borderRadius: 10, border: "1px solid var(--border)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            background: "#111316",
          }}
        />
      ) : mediaSrc ? (
        <img
          src={mediaSrc}
          alt={`Step ${step.step_number}`}
          style={{
            width: "100%", borderRadius: 10, border: "1px solid var(--border)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        />
      ) : (
        <div
          style={{
            height: 320, borderRadius: 10, border: "2px dashed var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-faint)", fontSize: 13,
          }}
        >
          No screenshot captured for this step
        </div>
      )}

      {step.source_url && (
        <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-faint)" }}>
          Captured from:{" "}
          <a href={step.source_url} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
            {step.source_url}
          </a>
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-faint)" }}>
        Step {step.step_number} of {totalSteps}
      </div>
    </div>
  );
}
