const TUS_VERSION = "1.0.0";
const RETRY_DELAYS_MS = [0, 1000, 3000, 5000];

export const CAPTURE_FILE_SIZE_LIMIT_BYTES = 50 * 1024 * 1024;
export const MAX_VIDEO_DURATION_MS = 10 * 60 * 1000;
export const VIDEO_BITS_PER_SECOND = 500000;
export const AUDIO_BITS_PER_SECOND = 48000;
export const RESUMABLE_UPLOAD_THRESHOLD_BYTES = 6 * 1024 * 1024;
export const TUS_CHUNK_SIZE_BYTES = 6 * 1024 * 1024;

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function uploadMetadata(values) {
  return Object.entries(values)
    .map(([key, value]) => `${key} ${encodeBase64(value)}`)
    .join(",");
}

function errorMessageFromBody(body) {
  if (!body) return "";
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed.message === "string") return parsed.message;
    if (typeof parsed.error === "string") return parsed.error;
    if (typeof parsed.error?.message === "string") return parsed.error.message;
    if (typeof parsed.error_description === "string") return parsed.error_description;
  } catch {
    // The response is plain text rather than JSON.
  }
  return body.replace(/\s+/g, " ").trim().slice(0, 300);
}

export async function uploadHttpError(response, fallback) {
  const detail = errorMessageFromBody(await response.text().catch(() => ""));
  const suffix = detail ? `: ${detail}` : "";
  return new Error(`${fallback} (HTTP ${response.status})${suffix}`);
}

function isRetryableStatus(status) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function validOffset(value, totalBytes) {
  if (value === null || !/^\d+$/.test(value)) return null;
  const offset = Number(value);
  return Number.isSafeInteger(offset) && offset >= 0 && offset <= totalBytes ? offset : null;
}

async function serverOffset(uploadUrl, token, totalBytes, fetchImpl) {
  const response = await fetchImpl(uploadUrl, {
    method: "HEAD",
    headers: {
      "Tus-Resumable": TUS_VERSION,
      "x-signature": token,
    },
  });
  if (!response.ok) throw await uploadHttpError(response, "Could not resume video upload");
  const offset = validOffset(response.headers.get("Upload-Offset"), totalBytes);
  if (offset === null) throw new Error("The upload server returned an invalid resume position.");
  return offset;
}

export async function uploadBlobResumable({
  endpoint,
  blob,
  token,
  bucketName,
  objectName,
  contentType,
  cacheControl = "3600",
  fetchImpl = fetch,
  onProgress,
}) {
  if (!blob.size) throw new Error("The recording is empty and cannot be uploaded.");

  const creationResponse = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "Tus-Resumable": TUS_VERSION,
      "Upload-Length": String(blob.size),
      "Upload-Metadata": uploadMetadata({
        bucketName,
        objectName,
        contentType,
        cacheControl,
      }),
      "x-signature": token,
    },
  });

  if (!creationResponse.ok) {
    throw await uploadHttpError(creationResponse, "Could not start video upload");
  }

  const location = creationResponse.headers.get("Location");
  if (!location) throw new Error("The upload server did not return a resumable upload URL.");
  const uploadUrl = new URL(location, endpoint).toString();
  let offset = validOffset(creationResponse.headers.get("Upload-Offset"), blob.size) ?? 0;
  onProgress?.(offset, blob.size);

  while (offset < blob.size) {
    const chunkStart = offset;
    const chunkEnd = Math.min(chunkStart + TUS_CHUNK_SIZE_BYTES, blob.size);
    const chunk = blob.slice(chunkStart, chunkEnd, "application/offset+octet-stream");
    let lastError = null;
    let advanced = false;

    for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
      if (RETRY_DELAYS_MS[attempt]) await delay(RETRY_DELAYS_MS[attempt]);
      try {
        const response = await fetchImpl(uploadUrl, {
          method: "PATCH",
          headers: {
            "Tus-Resumable": TUS_VERSION,
            "Upload-Offset": String(chunkStart),
            "Content-Type": "application/offset+octet-stream",
            "x-signature": token,
          },
          body: chunk,
        });

        if (response.ok) {
          const reportedOffset = validOffset(response.headers.get("Upload-Offset"), blob.size);
          offset = reportedOffset ?? chunkEnd;
          if (offset <= chunkStart) {
            throw new Error("The upload server did not advance the video upload.");
          }
          advanced = true;
          break;
        }

        const responseError = await uploadHttpError(response, "Video upload failed");
        lastError = responseError;
        if (!isRetryableStatus(response.status)) break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Video upload failed.");
      }

      if (attempt < RETRY_DELAYS_MS.length - 1) {
        try {
          const recoveredOffset = await serverOffset(uploadUrl, token, blob.size, fetchImpl);
          if (recoveredOffset !== chunkStart) {
            offset = recoveredOffset;
            advanced = true;
            break;
          }
        } catch {
          // Retry the same chunk; the original error is more useful if all retries fail.
        }
      }
    }

    if (!advanced) throw lastError ?? new Error("Video upload failed after multiple attempts.");
    onProgress?.(offset, blob.size);
  }

  return uploadUrl;
}

export function formatFileSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
