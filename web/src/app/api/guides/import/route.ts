import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ImportStep = {
  stepNumber?: number;
  title?: string;
  description?: string;
  type?: string;
  screenshotDataUrl?: string;
  annotatedScreenshotDataUrl?: string;
  annotationRect?: object | null;
  clickX?: number | null;
  clickY?: number | null;
  elementRect?: object | null;
  url?: string | null;
};

export async function OPTIONS(req: NextRequest) {
  return corsResponse(req, null, 200);
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return corsResponse(
      req,
      { error: "Please sign in to PinCapture before saving from the extension." },
      401
    );
  }

  const { title, steps } = (await req.json()) as {
    title?: string;
    steps?: ImportStep[];
  };

  if (!steps?.length) {
    return corsResponse(req, { error: "No captured steps to save." }, 400);
  }

  const { data: guide, error: guideError } = await supabase
    .from("guides")
    .insert({ title: title?.trim() || "Untitled Guide", user_id: user.id })
    .select()
    .single();

  if (guideError || !guide) {
    return corsResponse(
      req,
      { error: guideError?.message || "Could not create guide." },
      500
    );
  }

  const rows = steps.map((step, index) => ({
    guide_id: guide.id,
    step_number: step.stepNumber || index + 1,
    title: step.title || `Step ${index + 1}`,
    description: step.description || "",
    type: step.type || "click",
    screenshot_url: step.screenshotDataUrl || null,
    annotated_screenshot_url: step.annotatedScreenshotDataUrl || null,
    annotation_rect: step.annotationRect || null,
    click_x: step.clickX ?? null,
    click_y: step.clickY ?? null,
    element_rect: step.elementRect || null,
    source_url: step.url || null,
  }));

  const { error: stepsError } = await supabase.from("steps").insert(rows);

  if (stepsError) {
    await supabase.from("guides").delete().eq("id", guide.id);
    return corsResponse(
      req,
      { error: stepsError.message || "Could not save captured steps." },
      500
    );
  }

  return corsResponse(req, { guide });
}

function corsResponse(req: NextRequest, body: object | null, status = 200) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = origin.startsWith("chrome-extension://")
    ? origin
    : process.env.NEXT_PUBLIC_APP_URL || "https://pincapture.flowlog.dev";

  return NextResponse.json(body ?? {}, {
    status,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
      "Vary": "Origin",
    },
  });
}
