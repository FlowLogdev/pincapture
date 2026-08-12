import { NextRequest, NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";
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

const contentTypes: Record<string, string> = {
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppsx: "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
  pps: "application/vnd.ms-powerpoint",
};

export async function createPresentationResponse(req: NextRequest, extension: "pptx" | "ppsx" | "pps") {
  const gate = await requireEntitledUser();
  if (!gate.ok) return withCors(req, gate.response);

  const { title, steps } = (await req.json()) as { title: string; steps: ExportStep[] };

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
  pptx.layout = "WIDE";
  pptx.author = "PinCapture";
  pptx.subject = title;
  pptx.title = title;
  pptx.company = "PinCapture";

  for (const step of steps) {
    const slide = pptx.addSlide();
    const stepType = step.type || "step";

    slide.background = { color: "F6F7FB" };
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 0.72,
      fill: { color: "023465" },
      line: { color: "023465" },
    });

    slide.addText(title, {
      x: 0.35,
      y: 0.08,
      w: 8.8,
      h: 0.3,
      fontSize: 17,
      bold: true,
      color: "FFFFFF",
      margin: 0,
    });
    slide.addText(`Step ${step.stepNumber} of ${steps.length} - ${stepType}`, {
      x: 0.35,
      y: 0.41,
      w: 8.8,
      h: 0.22,
      fontSize: 11,
      color: "D7E6FF",
      margin: 0,
    });

    slide.addShape(pptx.ShapeType.ellipse, {
      x: 0.35,
      y: 0.95,
      w: 0.52,
      h: 0.52,
      fill: { color: "FFDD00" },
      line: { color: "FFDD00" },
    });
    slide.addText(String(step.stepNumber), {
      x: 0.35,
      y: 1.03,
      w: 0.52,
      h: 0.28,
      fontSize: 13,
      bold: true,
      color: "023465",
      align: "center",
      margin: 0,
    });

    slide.addText(step.title || "Untitled step", {
      x: 1.02,
      y: 0.92,
      w: 11.4,
      h: 0.42,
      fontSize: 19,
      bold: true,
      color: "0F172A",
      margin: 0,
      fit: "shrink",
    });

    if (step.description) {
      slide.addText(step.description, {
        x: 1.02,
        y: 1.36,
        w: 11.4,
        h: 0.36,
        fontSize: 12,
        color: "64748B",
        margin: 0,
        fit: "shrink",
      });
    }

    const imgData = step.annotatedScreenshotUrl || step.screenshotUrl;
    if (imgData) {
      const isDataUrl = imgData.startsWith("data:");
      try {
        slide.addImage({
          data: isDataUrl ? imgData : undefined,
          path: isDataUrl ? undefined : imgData,
          x: 0.25,
          y: 1.78,
          w: 12.83,
          h: 5.5,
          sizing: { type: "contain", x: 0.25, y: 1.78, w: 12.83, h: 5.5 },
        });
      } catch (e) {
        console.error("Image embed failed for step", step.stepNumber, e);
      }
    }
  }

  const buffer = await pptx.write({ outputType: "arraybuffer" });
  const blobPart =
    buffer instanceof ArrayBuffer
      ? buffer
      : buffer instanceof Blob
        ? buffer
        : typeof buffer === "string"
          ? buffer
          : new Uint8Array(buffer);
  const safeTitle = encodeURIComponent(title || "PinCapture Guide");

  return new NextResponse(new Blob([blobPart]), {
    headers: {
      "Content-Type": contentTypes[extension],
      "Content-Disposition": `attachment; filename="${safeTitle}.${extension}"`,
      ...corsHeaders(req),
    },
  });
}

export function presentationOptionsResponse(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: corsHeaders(req) });
}
