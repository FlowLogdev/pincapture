"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, type Guide } from "@/lib/supabase";

type ViewMode = "active" | "archived" | "trashed" | "deleted";

const viewLabels: Record<ViewMode, string> = {
  active: "Dashboard",
  archived: "Archive Folder",
  trashed: "Trash",
  deleted: "Deleted Records",
};

export default function DashboardPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState<ViewMode>("active");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    loadGuides();
  }, [view]);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserName(user.user_metadata?.full_name || user.email || "");
  }

  async function loadGuides() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/guides?status=${view}`);
    if (!res.ok) {
      setGuides([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setGuides(data.guides ?? []);
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

  async function signOut() {
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

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/pinvest-logo.svg" alt="Pinvest" style={{ height: 20, filter: "brightness(0) invert(1)" }} />
          <span style={productPillStyle}>PinCapture</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {userName && <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{userName}</span>}
          <Link href="/docs" style={docsButtonStyle}>DOCS</Link>
          <button onClick={createGuide} disabled={creating} style={newGuideStyle}>
            {creating ? "Creating..." : "+ New guide"}
          </button>
          <button onClick={signOut} style={signOutStyle}>Sign out</button>
        </div>
      </header>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "36px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#023465" }}>{viewLabels[view]}</h1>
          <div style={tabsStyle}>
            {(["active", "archived", "trashed", "deleted"] as ViewMode[]).map((mode) => (
              <button key={mode} onClick={() => setView(mode)} style={tabButtonStyle(view === mode)}>
                {viewLabels[mode]}
              </button>
            ))}
          </div>
        </div>

        {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}

        {error && <div style={errorStyle}>{error}</div>}

        {!loading && guides.length === 0 && <EmptyState view={view} onCreate={createGuide} />}

        {view === "active" && guides.length > 0 && (
          <div style={gridStyle}>
            {guides.map((guide) => (
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
        )}

        {view !== "active" && Object.entries(groupedGuides).map(([month, monthGuides]) => (
          <section key={month} style={{ marginBottom: 30 }}>
            <h2 style={{ color: "#023465", fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
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
  view: ViewMode;
  menuOpen: boolean;
  onMenu: () => void;
  onAction: (id: string, action: "archive" | "restore" | "trash" | "recover" | "permanentDelete") => void;
}) {
  return (
    <div style={cardStyle}>
      <button onClick={onMenu} aria-label="Guide actions" style={cardMenuButtonStyle}>...</button>
      {menuOpen && (
        <div style={menuStyle}>
          {view === "active" && (
            <>
              <button onClick={() => onAction(guide.id, "archive")} style={menuButtonStyle("#023465")}>Archive</button>
              <button onClick={() => onAction(guide.id, "trash")} style={menuButtonStyle("#dc2626")}>Move to Trash</button>
            </>
          )}
          {view === "archived" && (
            <>
              <button onClick={() => onAction(guide.id, "restore")} style={menuButtonStyle("#023465")}>Restore</button>
              <button onClick={() => onAction(guide.id, "trash")} style={menuButtonStyle("#dc2626")}>Move to Trash</button>
            </>
          )}
          {view === "trashed" && (
            <>
              <button onClick={() => onAction(guide.id, "recover")} style={menuButtonStyle("#023465")}>Recover</button>
              <button onClick={() => onAction(guide.id, "archive")} style={menuButtonStyle("#023465")}>Archive</button>
              <button onClick={() => onAction(guide.id, "permanentDelete")} style={menuButtonStyle("#dc2626")}>Permanent Delete</button>
            </>
          )}
          {view === "deleted" && (
            <button onClick={() => onAction(guide.id, "recover")} style={menuButtonStyle("#023465")}>Recover</button>
          )}
        </div>
      )}

      <div style={cardThumbStyle}>Guide</div>
      <div style={{ padding: "12px 16px", flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: "#023465" }}>{guide.title}</div>
        <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.55 }}>
          {guide.step_count} step{guide.step_count !== 1 ? "s" : ""}
          <br />
          Last recorded: {formatRecordedAt(guide.last_recorded_at || guide.updated_at)}
        </div>
      </div>
      <div style={{ padding: "10px 16px", borderTop: "1px solid #e2e5ef" }}>
        <Link href={`/guide/${guide.id}`} style={openButtonStyle}>Open</Link>
      </div>
    </div>
  );
}

function EmptyState({ view, onCreate }: { view: ViewMode; onCreate: () => void }) {
  const text: Record<ViewMode, string> = {
    active: "No guides yet.",
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

const headerStyle: CSSProperties = {
  background: "#023465",
  padding: "0 28px",
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const productPillStyle: CSSProperties = {
  background: "rgba(255,221,0,0.15)",
  color: "#FFDD00",
  fontSize: 11,
  fontWeight: 700,
  padding: "2px 8px",
  borderRadius: 4,
};

const docsButtonStyle: CSSProperties = {
  background: "#fff",
  color: "#023465",
  textDecoration: "none",
  borderRadius: 7,
  padding: "7px 13px",
  fontWeight: 800,
  fontSize: 13,
};

const newGuideStyle: CSSProperties = {
  background: "#FFDD00",
  color: "#023465",
  border: "none",
  borderRadius: 7,
  padding: "7px 16px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

const signOutStyle: CSSProperties = {
  background: "none",
  color: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 12,
  cursor: "pointer",
};

const tabsStyle: CSSProperties = {
  display: "flex",
  border: "1px solid #dbe2ee",
  borderRadius: 8,
  overflow: "hidden",
  background: "#fff",
  flexWrap: "wrap",
};

function tabButtonStyle(active: boolean): CSSProperties {
  return {
    border: 0,
    padding: "8px 13px",
    cursor: "pointer",
    background: active ? "#023465" : "#fff",
    color: active ? "#fff" : "#023465",
    fontWeight: 700,
    fontSize: 13,
  };
}

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 18,
};

const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e5ef",
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
  border: "1px solid rgba(2,52,101,0.16)",
  background: "rgba(255,255,255,0.94)",
  color: "#023465",
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
  background: "#fff",
  border: "1px solid #dbe2ee",
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
  background: "linear-gradient(135deg, #e8eeff 0%, #f0f4ff 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#023465",
  fontSize: 15,
  fontWeight: 800,
};

const openButtonStyle: CSSProperties = {
  display: "block",
  textAlign: "center",
  padding: "8px 0",
  background: "#023465",
  color: "#fff",
  borderRadius: 7,
  fontSize: 13,
  fontWeight: 700,
  textDecoration: "none",
};

const errorStyle: CSSProperties = {
  background: "#fef2f2",
  border: "1px solid #fca5a5",
  color: "#dc2626",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 13,
  marginBottom: 18,
};

const emptyStyle: CSSProperties = {
  textAlign: "center",
  padding: "68px 0",
  color: "#9ca3af",
  fontSize: 14,
  lineHeight: 1.8,
};

const emptyButtonStyle: CSSProperties = {
  background: "#023465",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 22px",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};
