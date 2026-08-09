import assert from "node:assert/strict";
import test from "node:test";
import {
  AUDIO_BITS_PER_SECOND,
  CAPTURE_FILE_SIZE_LIMIT_BYTES,
  MAX_VIDEO_DURATION_MS,
  TUS_CHUNK_SIZE_BYTES,
  uploadBlobResumable,
  uploadHttpError,
  VIDEO_BITS_PER_SECOND,
} from "../../extension/resumable-upload.mjs";

function response(status, headers = {}, body = null) {
  return new Response(body, { status, headers });
}

test("10-minute recording bitrate budget stays below the 50 MiB limit", () => {
  const estimatedBytes =
    ((VIDEO_BITS_PER_SECOND + AUDIO_BITS_PER_SECOND) * MAX_VIDEO_DURATION_MS) / 8000;
  assert.ok(estimatedBytes < CAPTURE_FILE_SIZE_LIMIT_BYTES * 0.85);
});

test("uploads a large recording in required 6 MiB TUS chunks", async () => {
  const blob = new Blob([new Uint8Array(TUS_CHUNK_SIZE_BYTES * 2 + 17)]);
  const requests = [];
  let serverOffset = 0;
  const progress = [];

  const fetchImpl = async (url, init = {}) => {
    requests.push({ url: String(url), init });
    if (init.method === "POST") {
      const headers = new Headers(init.headers);
      assert.equal(headers.get("Tus-Resumable"), "1.0.0");
      assert.equal(headers.get("Upload-Length"), String(blob.size));
      assert.match(headers.get("Upload-Metadata"), /bucketName Y2FwdHVyZXM=/);
      assert.equal(headers.get("x-signature"), "signed-token");
      return response(201, {
        Location: "/storage/v1/upload/resumable/session-1",
        "Upload-Offset": "0",
      });
    }

    assert.equal(init.method, "PATCH");
    const headers = new Headers(init.headers);
    assert.equal(headers.get("Upload-Offset"), String(serverOffset));
    assert.equal(headers.get("Content-Type"), "application/offset+octet-stream");
    assert.ok(init.body instanceof Blob);
    assert.ok(init.body.size <= TUS_CHUNK_SIZE_BYTES);
    serverOffset += init.body.size;
    return response(204, { "Upload-Offset": String(serverOffset) });
  };

  const uploadUrl = await uploadBlobResumable({
    endpoint: "https://project.storage.supabase.co/storage/v1/upload/resumable/sign",
    blob,
    token: "signed-token",
    bucketName: "captures",
    objectName: "user/video.webm",
    contentType: "video/webm",
    fetchImpl,
    onProgress: (uploaded) => progress.push(uploaded),
  });

  assert.equal(uploadUrl, "https://project.storage.supabase.co/storage/v1/upload/resumable/session-1");
  assert.equal(requests.filter(({ init }) => init.method === "PATCH").length, 3);
  assert.deepEqual(progress, [0, TUS_CHUNK_SIZE_BYTES, TUS_CHUNK_SIZE_BYTES * 2, blob.size]);
});

test("recovers with HEAD when a chunk succeeds but its response is lost", async () => {
  const blob = new Blob([new Uint8Array(TUS_CHUNK_SIZE_BYTES + 25)]);
  let serverOffset = 0;
  let droppedResponse = false;
  const patchOffsets = [];

  const fetchImpl = async (_url, init = {}) => {
    if (init.method === "POST") {
      return response(201, { Location: "https://upload.test/session", "Upload-Offset": "0" });
    }
    if (init.method === "HEAD") {
      return response(204, { "Upload-Offset": String(serverOffset) });
    }

    const requestOffset = Number(new Headers(init.headers).get("Upload-Offset"));
    patchOffsets.push(requestOffset);
    if (!droppedResponse) {
      droppedResponse = true;
      serverOffset += init.body.size;
      throw new Error("Connection dropped after the server accepted the chunk");
    }
    serverOffset += init.body.size;
    return response(204, { "Upload-Offset": String(serverOffset) });
  };

  await uploadBlobResumable({
    endpoint: "https://project.storage.supabase.co/storage/v1/upload/resumable/sign",
    blob,
    token: "signed-token",
    bucketName: "captures",
    objectName: "user/video.webm",
    contentType: "video/webm",
    fetchImpl,
  });

  assert.deepEqual(patchOffsets, [0, TUS_CHUNK_SIZE_BYTES]);
  assert.equal(serverOffset, blob.size);
});

test("includes Supabase's response message in upload errors", async () => {
  const error = await uploadHttpError(
    response(400, { "Content-Type": "application/json" }, JSON.stringify({ message: "The object exceeded the maximum allowed size" })),
    "Upload failed"
  );

  assert.equal(
    error.message,
    "Upload failed (HTTP 400): The object exceeded the maximum allowed size"
  );
});

test("does not retry a non-retryable Supabase 400 response", async () => {
  const blob = new Blob([new Uint8Array(TUS_CHUNK_SIZE_BYTES + 1)]);
  let patchRequests = 0;

  const fetchImpl = async (_url, init = {}) => {
    if (init.method === "POST") {
      return response(201, { Location: "https://upload.test/session", "Upload-Offset": "0" });
    }
    patchRequests += 1;
    return response(
      400,
      { "Content-Type": "application/json" },
      JSON.stringify({ message: "The object exceeded the maximum allowed size" })
    );
  };

  await assert.rejects(
    uploadBlobResumable({
      endpoint: "https://project.storage.supabase.co/storage/v1/upload/resumable/sign",
      blob,
      token: "signed-token",
      bucketName: "captures",
      objectName: "user/video.webm",
      contentType: "video/webm",
      fetchImpl,
    }),
    /The object exceeded the maximum allowed size/
  );
  assert.equal(patchRequests, 1);
});
