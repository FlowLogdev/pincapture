import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const LEGACY_ARCHIVE_PREFIX = "[PinCapture archived at ";
const STATUS_RE = /^\[PinCapture status=(archived|trashed|deleted) at ([^\]]+)\]\n?/;
const TICKET_PREFIX = "[PinCapture ticket]\n";

type GuideStatus = "active" | "archived" | "trashed" | "deleted";

function readState(description?: string | null): {
  status: GuideStatus;
  archivedAt: string | null;
  trashedAt: string | null;
  deletedAt: string | null;
} {
  const statusMatch = description?.match(STATUS_RE);
  if (statusMatch) {
    const status = statusMatch[1] as Exclude<GuideStatus, "active">;
    const date = statusMatch[2];
    return {
      status,
      archivedAt: status === "archived" ? date : null,
      trashedAt: status === "trashed" ? date : null,
      deletedAt: status === "deleted" ? date : null,
    };
  }

  if (description?.startsWith(LEGACY_ARCHIVE_PREFIX)) {
    const end = description.indexOf("]");
    const archivedAt = end === -1 ? null : description.slice(LEGACY_ARCHIVE_PREFIX.length, end);
    return { status: "archived", archivedAt, trashedAt: null, deletedAt: null };
  }

  return { status: "active", archivedAt: null, trashedAt: null, deletedAt: null };
}

function monthKey(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    timeZone: "America/New_York",
  }).formatToParts(new Date(value));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return year && month ? `${year}-${month}` : "Unsorted";
}

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("guides")
    .select("*, steps(id, created_at)")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Could not load guides." },
      { status: 500 }
    );
  }

  const requested = req.nextUrl.searchParams.get("status");
  const status: GuideStatus =
    requested === "archived" || requested === "trashed" || requested === "deleted"
      ? requested
      : "active";

  const guides = (data ?? [])
    .filter((guide: any) => !guide.description?.startsWith(TICKET_PREFIX))
    .map((guide: any) => {
      const stepDates = (guide.steps ?? [])
        .map((step: { created_at?: string }) => step.created_at)
        .filter(Boolean)
        .sort();
      const lastRecordedAt = stepDates.at(-1) || guide.created_at || guide.updated_at;
      const state = readState(guide.description);
      const stateDate = state.archivedAt || state.trashedAt || state.deletedAt || lastRecordedAt;

      return {
        ...guide,
        steps: undefined,
        step_count: guide.steps?.length ?? 0,
        last_recorded_at: lastRecordedAt,
        archived_at: state.archivedAt,
        trashed_at: state.trashedAt,
        deleted_at: state.deletedAt,
        archive_month: state.archivedAt ? monthKey(lastRecordedAt) : null,
        state_month: monthKey(stateDate),
        state_status: state.status,
      };
    })
    .filter((guide: any) => guide.state_status === status)
    .sort((a: any, b: any) => {
      const aTime = new Date(a.last_recorded_at || a.updated_at).getTime();
      const bTime = new Date(b.last_recorded_at || b.updated_at).getTime();
      return bTime - aTime;
    });

  return NextResponse.json({ guides });
}

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("guides")
    .insert({ title: "Untitled Guide", user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Create guide error:", error);
    return NextResponse.json(
      { error: error.message || "Could not create guide." },
      { status: 500 }
    );
  }

  return NextResponse.json({ guide: data });
}
