const APP_URL = "https://www.pincapturetool.com";

let recording = false;
let steps = [];

const recbtn = document.getElementById("recbtn");
const rectext = document.getElementById("rectext");
const stepsarea = document.getElementById("stepsarea");
const empty = document.getElementById("empty");
const guidetitle = document.getElementById("guidetitle");
const statusBox = document.getElementById("status");
const saveBtn = document.getElementById("save");
const clearBtn = document.getElementById("clear");
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
    const existing = steps.some((step) => step.id === msg.step.id);
    if (!existing) {
      steps.push(msg.step);
      renderSteps();
      setStatus(`Captured step ${msg.step.stepNumber}.`);
    }
  }
});

recbtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    setStatus("No active tab found.", true);
    return;
  }

  if (!recording) {
    try {
      await ensureRecorder(tab.id);
      await sendToTab(tab.id, { action: "SET_RECORDING", value: true });
      await chrome.runtime.sendMessage({
        action: "START_RECORDING",
        tabId: tab.id,
        title: guidetitle.value || "Untitled Guide"
      });
      steps = [];
      recording = true;
      setRecordingUi(true);
      renderSteps();
      setStatus("Recording started. Close this popup and click through the process.");
    } catch (error) {
      setStatus(
        "Could not start recording on this page. Try a normal website tab, not chrome:// or the Web Store.",
        true
      );
    }
    return;
  }

  await sendToTab(tab.id, { action: "SET_RECORDING", value: false }).catch(() => {});
  const res = await chrome.runtime.sendMessage({ action: "STOP_RECORDING" });
  steps = res?.steps || steps;
  recording = false;
  setRecordingUi(false);
  renderSteps();
  setStatus(`Recording stopped. ${steps.length} step${steps.length === 1 ? "" : "s"} captured.`);
});

saveBtn.addEventListener("click", async () => {
  if (!steps.length) return;
  setStatus("Uploading screenshots...");
  try {
    const uploadSteps = await prepareStepsForImport();
    const tab = await chrome.tabs.create({ url: `${APP_URL}/extension/import`, active: true });
    const payload = { title: guideTitle(), steps: uploadSteps };
    setStatus("Opening dashboard importer...");
    await sendImportPayload(tab.id, payload);
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
    steps.forEach((step) => stepsarea.appendChild(createStepCard(step)));
  }
  updateActions();
}

function createStepCard(step) {
  const card = document.createElement("div");
  card.className = "step";

  const img = document.createElement("img");
  img.alt = `Step ${step.stepNumber}`;
  img.src = step.annotatedScreenshotDataUrl || step.screenshotDataUrl || "";

  const info = document.createElement("div");
  info.className = "info";
  info.innerHTML = `
    <div class="title"><span class="num">${step.stepNumber}</span>${escapeHtml(step.title || "Untitled step")}</div>
    <div class="meta">${escapeHtml(step.type || "click")}</div>
  `;

  const del = document.createElement("button");
  del.className = "del";
  del.type = "button";
  del.textContent = "x";
  del.title = "Delete step";
  del.addEventListener("click", async () => {
    await chrome.runtime.sendMessage({ action: "DELETE_STEP", stepId: step.id });
    steps = steps.filter((item) => item.id !== step.id);
    steps.forEach((item, index) => {
      item.stepNumber = index + 1;
    });
    renderSteps();
  });

  card.append(img, info, del);
  return card;
}

function updateActions() {
  const hasSteps = steps.length > 0;
  saveBtn.disabled = !hasSteps;
  clearBtn.disabled = !hasSteps;
  Object.values(exportButtons).forEach((button) => {
    button.disabled = !hasSteps;
  });
}

function setRecordingUi(value) {
  recbtn.className = value ? "on" : "";
  rectext.textContent = value ? "Stop recording" : "Start recording";
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
      screenshotUrl: step.screenshotDataUrl,
      annotatedScreenshotUrl: step.annotatedScreenshotDataUrl || step.screenshotDataUrl
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
