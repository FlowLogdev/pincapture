import assert from "node:assert/strict";
import test from "node:test";
import {
  videoDownloadFileName,
  videoDownloadUrl,
} from "../src/lib/video-download.ts";

test("creates a safe WebM download name", () => {
  assert.equal(
    videoDownloadFileName("Dashboard video capture"),
    "Dashboard-video-capture.webm"
  );
  assert.equal(videoDownloadFileName("Quarterly review", 3), "Quarterly-review-3.webm");
  assert.equal(videoDownloadFileName("capture.webm"), "capture.webm");
});

test("adds Supabase's download parameter without losing existing parameters", () => {
  const url = videoDownloadUrl(
    "https://project.supabase.co/storage/v1/object/public/captures/user/video.webm?token=one",
    "Dashboard-video-capture.webm"
  );
  const parsed = new URL(url);

  assert.equal(parsed.searchParams.get("token"), "one");
  assert.equal(parsed.searchParams.get("download"), "Dashboard-video-capture.webm");
});

test("leaves inline videos downloadable by the browser", () => {
  const dataUrl = "data:video/webm;base64,AAAA";
  assert.equal(videoDownloadUrl(dataUrl, "capture.webm"), dataUrl);
});
