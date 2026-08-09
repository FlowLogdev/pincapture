export const MP4_RECORDING_MIME_TYPES = [
  "video/mp4;codecs=avc3.42E01E,mp4a.40.2",
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4;codecs=avc3.42E01E",
  "video/mp4;codecs=avc1.42E01E",
  "video/mp4",
] as const;

export function selectMp4RecordingMimeType(
  isTypeSupported: (mimeType: string) => boolean,
  includeAudio = false
) {
  return MP4_RECORDING_MIME_TYPES.find((mimeType) =>
    (includeAudio || !mimeType.includes("mp4a")) && isTypeSupported(mimeType)
  ) ?? null;
}

function videoFileExtension(mediaUrl?: string) {
  if (!mediaUrl) return "webm";

  if (/^data:video\/mp4(?:;|,)/i.test(mediaUrl)) return "mp4";
  if (/^data:video\/webm(?:;|,)/i.test(mediaUrl)) return "webm";

  try {
    const pathname = new URL(mediaUrl).pathname;
    if (/\.mp4$/i.test(pathname)) return "mp4";
    if (/\.webm$/i.test(pathname)) return "webm";
  } catch {
    if (/\.mp4(?:$|[?#])/i.test(mediaUrl)) return "mp4";
  }

  return "webm";
}

export function videoDownloadFileName(title: string, stepNumber?: number, mediaUrl?: string) {
  const extension = videoFileExtension(mediaUrl);
  const base = (title || "pincapture-video")
    .trim()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/\.(?:webm|mp4)$/i, "")
    .slice(0, 100) || "pincapture-video";
  const stepSuffix = stepNumber && stepNumber > 1 ? `-${stepNumber}` : "";

  return `${base}${stepSuffix}.${extension}`;
}

export function videoDownloadUrl(mediaUrl: string, fileName: string) {
  if (mediaUrl.startsWith("data:") || mediaUrl.startsWith("blob:")) {
    return mediaUrl;
  }

  try {
    const url = new URL(mediaUrl);
    if (url.pathname.includes("/storage/v1/object/")) {
      url.searchParams.set("download", fileName);
    }
    return url.toString();
  } catch {
    return mediaUrl;
  }
}
