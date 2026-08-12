import React from "react";
import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { requireEntitledUser } from "@/lib/require-entitlement";
import { corsHeaders, withCors } from "@/lib/cors";

type ExportStep = {
  stepNumber: number;
  title?: string;
  description?: string;
  type?: string;
  screenshotUrl?: string;
  annotatedScreenshotUrl?: string;
};

const h = React.createElement;

const styles = StyleSheet.create({
  page: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#023465",
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 14,
  },
  step: {
    backgroundColor: "#FFFFFF",
    padding: 0,
    marginBottom: 14,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFDD00",
    color: "#023465",
    fontSize: 14,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 7,
  },
  stepTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 700,
    color: "#0F172A",
  },
  type: {
    fontSize: 11,
    color: "#1E40AF",
    backgroundColor: "#EFF6FF",
    borderRadius: 4,
    padding: "3px 6px",
  },
  description: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.45,
    marginBottom: 10,
  },
  screenshot: {
    width: "100%",
    maxHeight: 430,
    objectFit: "contain",
  },
  empty: {
    height: 120,
    border: "1px dashed #CBD5E1",
    borderRadius: 4,
    color: "#94A3B8",
    fontSize: 10,
    textAlign: "center",
    paddingTop: 52,
  },
});

function PdfGuide({ title, steps }: { title: string; steps: ExportStep[] }) {
  return h(
    Document,
    { title, author: "PinCapture" },
    h(
      Page,
      { size: "A4", orientation: "landscape", style: styles.page },
      h(Text, { style: styles.title }, title),
      h(Text, { style: styles.meta }, `${steps.length} steps`),
      ...steps.map((step) => {
        const imageUrl = step.annotatedScreenshotUrl || step.screenshotUrl;

        return h(
          View,
          { key: step.stepNumber, style: styles.step, wrap: false },
          h(
            View,
            { style: styles.stepHeader },
            h(Text, { style: styles.badge }, String(step.stepNumber)),
            h(Text, { style: styles.stepTitle }, step.title || "Untitled step"),
            h(Text, { style: styles.type }, step.type || "step")
          ),
          step.description
            ? h(Text, { style: styles.description }, step.description)
            : null,
          imageUrl
            ? h(Image, { src: imageUrl, style: styles.screenshot })
            : h(Text, { style: styles.empty }, "No screenshot captured")
        );
      })
    )
  );
}

export async function POST(req: NextRequest) {
  const gate = await requireEntitledUser();
  if (!gate.ok) return withCors(req, gate.response);

  const { title, steps } = (await req.json()) as {
    title?: string;
    steps?: ExportStep[];
  };
  const guideTitle = title || "PinCapture Guide";
  const guideSteps = steps ?? [];
  const buffer = await renderToBuffer(h(PdfGuide, { title: guideTitle, steps: guideSteps }));
  const safeTitle = encodeURIComponent(guideTitle);

  return new NextResponse(new Blob([new Uint8Array(buffer)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeTitle}.pdf"`,
      ...corsHeaders(req),
    },
  });
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: corsHeaders(req) });
}
