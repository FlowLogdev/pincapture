// app/api/export/docx/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  Document, Packer, Paragraph, TextRun, ImageRun,
  HeadingLevel,
} from "docx";

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    if (url.startsWith("data:")) {
      const base64 = url.split(",")[1];
      return Buffer.from(base64, "base64");
    }
    const res = await fetch(url);
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { title, steps } = await req.json();

  const children: any[] = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${steps.length} steps`, color: "6B7280", size: 22 }),
      ],
      spacing: { after: 600 },
    }),
  ];

  for (const step of steps) {
    // Step heading
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${step.stepNumber}. `, bold: true, color: "1a6bff", size: 32 }),
          new TextRun({ text: step.title || "Untitled Step", bold: true, size: 32 }),
        ],
        spacing: { before: 400, after: 120 },
      })
    );

    // Type badge
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `  ${step.type}  `, color: "1a6bff", size: 22, highlight: "cyan" }),
        ],
        spacing: { after: 120 },
      })
    );

    // Description
    if (step.description) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: step.description, color: "6B7280", size: 26 })],
          spacing: { after: 200 },
        })
      );
    }

    // Screenshot
    const imgUrl = step.annotatedScreenshotUrl || step.screenshotUrl;
    if (imgUrl) {
      const imgBuf = await fetchImageBuffer(imgUrl);
      if (imgBuf) {
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imgBuf,
                transformation: { width: 690, height: 388 },
              }),
            ],
            spacing: { after: 400 },
          })
        );
      }
    }
    children.push(new Paragraph({ spacing: { after: 360 } }));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 24 },
        },
      },
    },
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(new Blob([new Uint8Array(buffer)]), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(title)}.docx"`,
    },
  });
}
