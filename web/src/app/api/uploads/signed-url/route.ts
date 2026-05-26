import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const BUCKET = "captures";

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return corsResponse(req,
      { error: "Your session expired. Please sign in again." },
      401
    );
  }

  const { fileName, contentType } = (await req.json()) as {
    fileName?: string;
    contentType?: string;
  };

  const safeName = (fileName || "capture.webm")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "capture.webm";
  const type = contentType || "video/webm";
  const path = `${user.id}/${Date.now()}-${safeName}`;
  const service = createServiceClient();

  const { error: bucketError } = await service.storage.getBucket(BUCKET);
  if (bucketError) {
    const { error: createError } = await service.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 104857600,
      allowedMimeTypes: ["video/webm", "image/png", "image/jpeg"],
    });
    if (createError) {
      return corsResponse(req,
        { error: createError.message || "Could not prepare capture storage." },
        500
      );
    }
  }

  const { data, error } = await service.storage
    .from(BUCKET)
    .createSignedUploadUrl(path, { upsert: true });

  if (error || !data) {
    return corsResponse(req,
      { error: error?.message || "Could not create upload URL." },
      500
    );
  }

  const { data: publicData } = service.storage.from(BUCKET).getPublicUrl(path);

  return corsResponse(req, {
    bucket: BUCKET,
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl: publicData.publicUrl,
    contentType: type,
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsResponse(req, null, 200);
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
