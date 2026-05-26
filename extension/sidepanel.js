const APP_URL = "https://pincapture.flowlog.dev";

let recording = false;
let steps = [];
let videoStream = null;
let videoRecorder = null;
let videoChunks = [];

const captureBtn = document.getElementById("capturebtn");
const captureText = document.getElementById("capturetext");
const shotBtn = document.getElementById("shotbtn");
const startVideoBtn = document.getElementById("startvideo");
const stopVideoBtn = document.getElementById("stopvideo");
const stepsarea = document.getElementById("stepsarea");
const empty = document.getElementById("empty");
const guidetitle = document.getElementById("guidetitle");
const statusBox = document.getElementById("status");
const finishBtn = document.getElementById("finish");
const clearBtn = document.getElementById("clear");
const count = document.getElementById("count");
const exportButtons = {
  pdf: document.getElementById("expPdf"),
  docx: document.getElementById("expDocx"),
  pptx: document.getElementById("expPptx"),
  ppsx: document.getElementById("expPpsx"),
  pps: document.getElementById("expPps")
};

chrome.runtime.sendMessage({ action: "GET_SESSION" }, (res) => {
  steps = res?.steps || [];
  recording = Boolean(res?.recording);
  guidetitle.value = res?.title || "Untitled Guide";
  setRecordingUi(recording);
  renderSteps();
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "STEP_ADDED") {
    const exists = steps.some((step) => step.id === msg.step.id);
    if (!exists) {
      steps.push(msg.step);
      renderSteps();
      setStatus(`Captured slide ${msg.step.stepNumber}.`);
    }
  }
});

captureBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    setStatus("No active tab found.", true);
    return;
  }

  if (!recording) {
    try {
      await chrome.runtime.sendMessage({
        action: "START_RECORDING",
        tabId: tab.id,
        title: guidetitle.value || "Untitled Guide"
      });
      recording = true;
      setRecordingUi(true);
      renderSteps();
      setStatus(`Capture mode is on. ${steps.length} slide${steps.length === 1 ? "" : "s"} kept in this session.`);
    } catch {
      setStatus("Could not start capture: reload this tab after reloading the extension, then try again.", true);
    }
    return;
  }

  const res = await chrome.runtime.sendMessage({ action: "STOP_RECORDING" });
  steps = res?.steps || steps;
  recording = false;
  setRecordingUi(false);
  renderSteps();
  setStatus(`Stopped. ${steps.length} slide${steps.length === 1 ? "" : "s"} captured.`);
});

shotBtn.addEventListener("click", async () => {
  if (!recording) return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.windowId) {
    setStatus("No active tab found.", true);
    return;
  }

  try {
    const res = await chrome.runtime.sendMessage({
      action: "CAPTURE_MANUAL_SCREENSHOT",
      tabId: tab.id,
      windowId: tab.windowId,
      url: tab.url || ""
    });
    if (!res?.ok) {
      throw new Error(res?.error || "Could not capture screenshot.");
    }
    setStatus(`Captured slide ${res.step.stepNumber}.`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Could not capture screenshot.", true);
  }
});

startVideoBtn.addEventListener("click", async () => {
  if (videoRecorder?.state === "recording") return;
  setStatus("Choose the tab, window, or screen you want to record.");

  try {
    videoStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });

    videoChunks = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    videoRecorder = new MediaRecorder(videoStream, { mimeType });
    videoRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) videoChunks.push(event.data);
    };
    videoRecorder.onstop = async () => {
      try {
        setStatus("Uploading video recording...");
        const blob = new Blob(videoChunks, { type: "video/webm" });
        const videoDataUrl = await uploadCaptureBlob(blob, `${fileTitle()}-${Date.now()}.webm`, "video/webm");
        const stepNumber = steps.length + 1;
        const step = {
          id: crypto.randomUUID(),
          stepNumber,
          title: `Video recording ${stepNumber}`,
          description: "Recorded from the PinCapture Chrome extension.",
          type: "video",
          videoDataUrl,
          url: "",
          timestamp: Date.now()
        };
        steps.push(step);
        await chrome.runtime.sendMessage({ action: "ADD_VIDEO_STEP", step });
        renderSteps();
        setStatus(`Video recording ${stepNumber} is ready to save.`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not prepare video recording.", true);
      } finally {
        stopVideoTracks();
        setVideoUi(false);
      }
    };
    videoStream.getVideoTracks()[0]?.addEventListener("ended", () => {
      if (videoRecorder?.state === "recording") {
        videoRecorder.stop();
      } else {
        stopVideoTracks();
        setVideoUi(false);
      }
    });
    videoRecorder.start(1000);
    setVideoUi(true);
    setStatus("Recording video...");
  } catch (error) {
    stopVideoTracks();
    setVideoUi(false);
    setStatus(error instanceof Error ? error.message : "Could not start video capture.", true);
  }
});

stopVideoBtn.addEventListener("click", () => {
  if (videoRecorder?.state === "recording") {
    setStatus("Stopping video recording...");
    videoRecorder.stop();
  }
});

finishBtn.addEventListener("click", async () => {
  if (!steps.length) return;
  if (recording) {
    await chrome.runtime.sendMessage({ action: "STOP_RECORDING" });
    recording = false;
    setRecordingUi(false);
  }

  setStatus("Uploading screenshots...");
  try {
    const uploadSteps = await prepareStepsForImport();
    setStatus("Opening dashboard importer...");
    const tab = await chrome.tabs.create({ url: `${APP_URL}/extension/import`, active: true });
    await sendImportPayload(tab.id, { title: guideTitle(), steps: uploadSteps });
    setStatus("Import page opened.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Could not save guide.", true);
  }
});

clearBtn.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ action: "CLEAR_SESSION" });
  steps = [];
  renderSteps();
  setStatus("Session cleared.");
});

Object.entries(exportButtons).forEach(([format, button]) => {
  button.addEventListener("click", () => exportGuide(format));
});

document.getElementById("openapp").addEventListener("click", () => {
  chrome.tabs.create({ url: `${APP_URL}/dashboard` });
});

async function exportGuide(format) {
  if (!steps.length) return;
  setStatus(`Preparing ${format.toUpperCase()} export...`);

  try {
    const res = await fetch(`${APP_URL}/api/export/${format}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toExportPayload())
    });
    if (!res.ok) throw new Error(`Export failed with status ${res.status}.`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    await chrome.downloads.download({
      url,
      filename: `${fileTitle()}.${format}`,
      saveAs: true
    });
    setStatus(`${format.toUpperCase()} export ready.`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Export failed.", true);
  }
}

function renderSteps() {
  stepsarea.innerHTML = "";
  if (!steps.length) {
    stepsarea.appendChild(empty);
  } else {
    steps.forEach((step) => stepsarea.appendChild(createSlideCard(step)));
  }
  updateActions();
}

function createSlideCard(step) {
  const card = document.createElement("div");
  card.className = "slide";

  const top = document.createElement("div");
  top.className = "slideTop";
  top.innerHTML = `
    <span class="num">${step.stepNumber}</span>
    <div class="titleWrap">
      <div class="title">Slide ${step.stepNumber}: ${escapeHtml(step.title || "Captured screenshot")}</div>
      <div class="meta">${escapeHtml(step.type || "click")}</div>
    </div>
  `;

  const del = document.createElement("button");
  del.className = "del";
  del.type = "button";
  del.textContent = "x";
  del.title = "Delete slide";
  del.addEventListener("click", async () => {
    await chrome.runtime.sendMessage({ action: "DELETE_STEP", stepId: step.id });
    steps = steps.filter((item) => item.id !== step.id);
    steps.forEach((item, index) => {
      item.stepNumber = index + 1;
    });
    renderSteps();
  });
  top.appendChild(del);

  const media = document.createElement(step.type === "video" ? "video" : "img");
  if (step.type === "video") {
    media.controls = true;
    media.src = step.videoDataUrl || step.annotatedScreenshotDataUrl || step.screenshotDataUrl || "";
  } else {
    media.alt = `Slide ${step.stepNumber}`;
    media.src = step.annotatedScreenshotDataUrl || step.screenshotDataUrl || "";
  }

  card.append(top, media);
  return card;
}

function updateActions() {
  const hasSteps = steps.length > 0;
  count.textContent = `${steps.length} slide${steps.length === 1 ? "" : "s"}`;
  shotBtn.disabled = !recording;
  finishBtn.disabled = !hasSteps;
  clearBtn.disabled = !hasSteps;
  Object.values(exportButtons).forEach((button) => {
    button.disabled = !hasSteps;
  });
}

function setRecordingUi(value) {
  captureBtn.className = value ? "on" : "";
  captureText.textContent = value ? "Stop Screenshots" : "Start Capture Screenshots";
  shotBtn.disabled = !value;
}

function setVideoUi(value) {
  startVideoBtn.disabled = value;
  stopVideoBtn.disabled = !value;
}

function stopVideoTracks() {
  videoStream?.getTracks().forEach((track) => track.stop());
  videoStream = null;
}

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.className = `show${isError ? " error" : ""}`;
}

function sendToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

async function ensureRecorder(tabId) {
  try {
    await sendToTab(tabId, { action: "PING" });
    return;
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  }

  await new Promise((resolve) => setTimeout(resolve, 150));
  await sendToTab(tabId, { action: "PING" });
}

function sendImportPayload(tabId, payload) {
  return new Promise((resolve, reject) => {
    if (!tabId) {
      reject(new Error("Could not open import tab."));
      return;
    }

    let done = false;
    let attempts = 0;

    const trySend = () => {
      if (done) return;
      attempts += 1;
      ensureRecorder(tabId)
        .then(() => chrome.tabs.sendMessage(tabId, { action: "IMPORT_GUIDE", payload }, (response) => {
          if (!chrome.runtime.lastError) {
            done = true;
            chrome.tabs.onUpdated.removeListener(listener);
            resolve(response);
            return;
          }
          if (attempts < 8) {
            setTimeout(trySend, 500);
            return;
          }
          done = true;
          chrome.tabs.onUpdated.removeListener(listener);
          reject(new Error(chrome.runtime.lastError.message));
        }))
        .catch((error) => {
          if (attempts < 8) {
            setTimeout(trySend, 500);
            return;
          }
          done = true;
          chrome.tabs.onUpdated.removeListener(listener);
          reject(error);
        });
    };

    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId !== tabId || changeInfo.status !== "complete") return;
      setTimeout(trySend, 300);
    };

    chrome.tabs.onUpdated.addListener(listener);
    setTimeout(trySend, 1200);
  });
}

function toExportPayload() {
  return {
    title: guideTitle(),
    steps: steps.map((step) => ({
      stepNumber: step.stepNumber,
      title: step.title,
      description: step.description || "",
      type: step.type || "click",
      screenshotUrl: step.screenshotDataUrl || step.videoDataUrl,
      annotatedScreenshotUrl: step.annotatedScreenshotDataUrl || step.screenshotDataUrl || step.videoDataUrl
    }))
  };
}

async function prepareStepsForImport() {
  const uploaded = new Map();
  const prepared = [];

  for (const [index, step] of steps.entries()) {
    const next = {
      ...step,
      stepNumber: index + 1
    };

    if (step.type !== "video") {
      const screenshotUrl = step.screenshotDataUrl || "";
      const annotatedUrl = step.annotatedScreenshotDataUrl || screenshotUrl;
      const uploadedScreenshot = await uploadDataUrlOnce(
        uploaded,
        screenshotUrl,
        `${fileTitle()}-slide-${index + 1}.png`
      );
      const uploadedAnnotated = annotatedUrl === screenshotUrl
        ? uploadedScreenshot
        : await uploadDataUrlOnce(
          uploaded,
          annotatedUrl,
          `${fileTitle()}-slide-${index + 1}-annotated.png`
        );

      next.screenshotDataUrl = uploadedScreenshot || screenshotUrl;
      next.annotatedScreenshotDataUrl = uploadedAnnotated || uploadedScreenshot || annotatedUrl;
    }

    prepared.push(next);
  }

  return prepared;
}

async function uploadDataUrlOnce(cache, value, fileName) {
  if (!value || !value.startsWith("data:")) return value;
  if (cache.has(value)) return cache.get(value);

  const blob = await dataUrlToBlob(value);
  const url = await uploadCaptureBlob(blob, fileName, blob.type || "image/png");
  cache.set(value, url);
  return url;
}

async function dataUrlToBlob(value) {
  const res = await fetch(value);
  return res.blob();
}

async function uploadCaptureBlob(blob, fileName, contentType) {
  const res = await fetch(`${APP_URL}/api/uploads/signed-url`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, contentType })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Sign in to PinCapture in the dashboard, then try again.");
  }

  const form = new FormData();
  form.append("cacheControl", "3600");
  form.append("", blob, fileName);

  const upload = await fetch(data.signedUrl, {
    method: "PUT",
    body: form
  });
  if (!upload.ok) {
    throw new Error(`Upload failed with status ${upload.status}.`);
  }

  return data.publicUrl;
}

function guideTitle() {
  return guidetitle.value.trim() || "Untitled Guide";
}

function fileTitle() {
  return guideTitle().replace(/[^a-z0-9_-]+/gi, "_").replace(/^_+|_+$/g, "") || "PinCapture_Guide";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}
