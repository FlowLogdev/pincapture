import assert from "node:assert/strict";
import test from "node:test";
import {
  selectMp4RecordingMimeType,
  videoDownloadFileName,
  videoDownloadUrl,
} from "../src/lib/video-download.ts";

test("creates a safe download name that matches the recording container", () => {
  assert.equal(
    videoDownloadFileName("Dashboard video capture"),
    "Dashboard-video-capture.webm"
  );
  assert.equal(videoDownloadFileName("Quarterly review", 3), "Quarterly-review-3.webm");
  assert.equal(videoDownloadFileName("capture.webm"), "capture.webm");
  assert.equal(
    videoDownloadFileName("Dashboard video capture", undefined, "https://example.com/video.mp4"),
    "Dashboard-video-capture.mp4"
  );
  assert.equal(
    videoDownloadFileName("capture.webm", 3, "data:video/mp4;base64,AAAA"),
    "capture-3.mp4"
  );
});

test("selects a supported MP4 recording type and never falls back to WebM", () => {
  assert.equal(
    selectMp4RecordingMimeType((type) => type === "video/mp4;codecs=avc1.42E01E"),
    "video/mp4;codecs=avc1.42E01E"
  );
  assert.equal(selectMp4RecordingMimeType(() => false), null);
  assert.equal(
    selectMp4RecordingMimeType(
      (type) => type === "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      true
    ),
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2"
  );
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
