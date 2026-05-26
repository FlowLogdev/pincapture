"use client";

import { useEffect, useState } from "react";

type ImportMessage = {
  source?: string;
  type?: string;
  payload?: {
    title: string;
    steps: unknown[];
  };
};

export default function ExtensionImportPage() {
  const [status, setStatus] = useState("Waiting for captured steps...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleMessage(event: MessageEvent<ImportMessage>) {
      if (event.source !== window) return;
      if (event.data?.source !== "pincapture-extension") return;
      if (event.data.type !== "IMPORT_GUIDE") return;

      setStatus("Saving captured guide...");
      setError("");

      try {
        const payload = event.data.payload;
        const stillContainsEmbeddedMedia = payload?.steps?.some((step: unknown) => {
          if (!step || typeof step !== "object") return false;
          const item = step as {
            screenshotDataUrl?: string;
            annotatedScreenshotDataUrl?: string;
            videoDataUrl?: string;
          };
          return item.screenshotDataUrl?.startsWith("data:")
            || item.annotatedScreenshotDataUrl?.startsWith("data:")
            || item.videoDataUrl?.startsWith("data:");
        });

        if (stillContainsEmbeddedMedia) {
          throw new Error("This capture was sent by an older PinCapture extension. Reload the extension in chrome://extensions, then click Finish and save again. Your slides are still in the side panel.");
        }

        const res = await fetch("/api/guides/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await res.json()
          : { error: await res.text() };
        if (!res.ok) {
          throw new Error(data.error || "Could not save guide.");
        }
        setStatus("Saved. Opening editor...");
        window.location.href = `/guide/${data.guide.id}`;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save guide.");
        setStatus("Import failed.");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f6f7fb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: 24,
    }}>
      <section style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 32,
        width: "100%",
        maxWidth: 420,
        textAlign: "center",
        boxShadow: "0 6px 24px rgba(15,23,42,0.08)",
      }}>
        <div style={{
          display: "inline-flex",
          background: "#023465",
          color: "#ffdd00",
          borderRadius: 7,
          padding: "5px 12px",
          fontSize: 13,
          fontWeight: 800,
          marginBottom: 18,
        }}>
          PinCapture
        </div>
        <h1 style={{ margin: "0 0 8px", color: "#023465", fontSize: 22 }}>
          Importing capture
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
          {status}
        </p>
        {error && (
          <p style={{
            margin: "18px 0 0",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            borderRadius: 8,
            padding: 10,
            fontSize: 13,
          }}>
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
