import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const LEGACY_ARCHIVE_PREFIX = "[PinCapture archived at ";
const STATUS_RE = /^\[PinCapture status=(archived|trashed|deleted) at ([^\]]+)\]\n?/;

type GuideAction = "archive" | "restore" | "trash" | "recover" | "permanentDelete";

function stripStateMarker(description?: string | null) {
  if (!description) return null;
  const withoutStatus = description.replace(STATUS_RE, "").trim();
  if (!withoutStatus.startsWith(LEGACY_ARCHIVE_PREFIX)) return withoutStatus || null;
  const end = withoutStatus.indexOf("]");
  if (end === -1) return null;
  return withoutStatus.slice(end + 1).trim() || null;
}

function statusDescription(status: "archived" | "trashed" | "deleted", base: string | null) {
  return `[PinCapture status=${status} at ${new Date().toISOString()}]\n${base ?? ""}`.trim();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  const [{ data: guide, error: guideError }, { data: steps, error: stepsError }] =
    await Promise.all([
      supabase.from("guides").select("*").eq("id", params.id).single(),
      supabase.from("steps").select("*").eq("guide_id", params.id).order("step_number"),
    ]);

  if (guideError || !guide) {
    return NextResponse.json(
      { error: guideError?.message || "Guide not found." },
      { status: 404 }
    );
  }

  if (stepsError) {
    return NextResponse.json(
      { error: stepsError.message || "Could not load steps." },
      { status: 500 }
    );
  }

  return NextResponse.json({ guide, steps: steps ?? [] });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  const { action } = (await req.json()) as { action?: GuideAction };
  if (!action || !["archive", "restore", "trash", "recover", "permanentDelete"].includes(action)) {
    return NextResponse.json({ error: "Unsupported guide action." }, { status: 400 });
  }

  const { data: guide, error: guideError } = await supabase
    .from("guides")
    .select("description")
    .eq("id", params.id)
    .single();

  if (guideError || !guide) {
    return NextResponse.json(
      { error: guideError?.message || "Guide not found." },
      { status: 404 }
    );
  }

  const baseDescription = stripStateMarker(guide.description);
  const description =
    action === "archive"
      ? statusDescription("archived", baseDescription)
      : action === "trash"
        ? statusDescription("trashed", baseDescription)
        : action === "permanentDelete"
          ? statusDescription("deleted", baseDescription)
          : baseDescription;

  const { data, error } = await supabase
    .from("guides")
    .update({ description })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message || "Could not update guide." },
      { status: 500 }
    );
  }

  return NextResponse.json({ guide: data });
}
