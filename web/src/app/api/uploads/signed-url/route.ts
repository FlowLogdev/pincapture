import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CAPTURE_FILE_SIZE_LIMIT_BYTES } from "@/lib/resumable-upload";
import { checkEntitlement } from "@/lib/require-entitlement";
import { corsHeaders } from "@/lib/cors";

const BUCKET = "captures";
const ALLOWED_CONTENT_TYPES = new Set(["video/mp4", "video/webm", "image/png", "image/jpeg"]);

function resumableUploadUrl() {
  const projectUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  if (projectUrl.hostname.endsWith(".supabase.co")) {
    projectUrl.hostname = projectUrl.hostname.replace(/\.supabase\.co$/, ".storage.supabase.co");
  }
  projectUrl.pathname = "/storage/v1/upload/resumable/sign";
  projectUrl.search = "";
  projectUrl.hash = "";
  return projectUrl.toString();
}

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

  if (!(await checkEntitlement(user.id, user.email))) {
    return corsResponse(req,
      { error: "Subscribe to continue using PinCapture." },
      402
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
  if (!ALLOWED_CONTENT_TYPES.has(type)) {
    return corsResponse(req, { error: `Unsupported capture type: ${type}` }, 400);
  }
  const path = `${user.id}/${Date.now()}-${safeName}`;
  const service = createServiceClient();

  const { data: bucket, error: bucketError } = await service.storage.getBucket(BUCKET);
  if (bucketError) {
    const { error: createError } = await service.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: CAPTURE_FILE_SIZE_LIMIT_BYTES,
      allowedMimeTypes: Array.from(ALLOWED_CONTENT_TYPES),
    });
    if (createError) {
      return corsResponse(req,
        { error: createError.message || "Could not prepare capture storage." },
        500
      );
    }
  } else if (bucket) {
    const existingMimeTypes = bucket.allowed_mime_types;
    const updatedMimeTypes = existingMimeTypes == null
      ? null
      : Array.from(new Set([...existingMimeTypes, ...Array.from(ALLOWED_CONTENT_TYPES)]));
    const existingLimit = bucket.file_size_limit ?? null;
    const updatedLimit = existingLimit == null
      ? null
      : Math.max(existingLimit, CAPTURE_FILE_SIZE_LIMIT_BYTES);
    const needsUpdate = !bucket.public
      || (existingMimeTypes != null && updatedMimeTypes?.length !== existingMimeTypes.length)
      || (existingLimit != null && existingLimit < CAPTURE_FILE_SIZE_LIMIT_BYTES);

    if (needsUpdate) {
      const { error: updateError } = await service.storage.updateBucket(BUCKET, {
        public: true,
        fileSizeLimit: updatedLimit,
        allowedMimeTypes: updatedMimeTypes,
      });
      if (updateError) {
        return corsResponse(req,
          { error: updateError.message || "Could not update capture storage." },
          500
        );
      }
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
    resumableUrl: resumableUploadUrl(),
    maxFileSizeBytes: CAPTURE_FILE_SIZE_LIMIT_BYTES,
  });
}

export async function OPTIONS(req: NextRequest) {
  return corsResponse(req, null, 200);
}

function corsResponse(req: NextRequest, body: object | null, status = 200) {
  return NextResponse.json(body ?? {}, { status, headers: corsHeaders(req) });
}
