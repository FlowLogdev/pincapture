export function videoDownloadFileName(title: string, stepNumber?: number) {
  const base = (title || "pincapture-video")
    .trim()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/\.webm$/i, "")
    .slice(0, 100) || "pincapture-video";
  const stepSuffix = stepNumber && stepNumber > 1 ? `-${stepNumber}` : "";

  return `${base}${stepSuffix}.webm`;
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
