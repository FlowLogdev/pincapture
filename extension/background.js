let recordingTabId = null;
let sessionSteps = [];
let sessionGuideTitle = "Untitled Guide";

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id }).catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "START_RECORDING") {
    recordingTabId = msg.tabId || sender.tab?.id || null;
    sessionGuideTitle = msg.title || "Untitled Guide";
    chrome.action.setBadgeText({ text: "REC" });
    chrome.action.setBadgeBackgroundColor({ color: "#dc2626" });
    sendResponse({ ok: true });
    return;
  }

  if (msg.action === "STOP_RECORDING") {
    recordingTabId = null;
    chrome.action.setBadgeText({ text: "" });
    sendResponse({ ok: true, steps: sessionSteps });
    return;
  }

  if (msg.action === "CAPTURE_SCREENSHOT") {
    const tabId = sender.tab?.id;
    if (!tabId || (recordingTabId && tabId !== recordingTabId)) {
      sendResponse({ ok: false, error: "Recording is not active for this tab." });
      return;
    }

    chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }

      const stepNumber = sessionSteps.length + 1;
      const step = {
        id: crypto.randomUUID(),
        stepNumber,
        title: msg.label || `Step ${stepNumber}`,
        description: `Click on "${msg.label || "selected element"}"`,
        type: msg.type || "click",
        screenshotDataUrl: dataUrl,
        annotatedScreenshotDataUrl: dataUrl,
        annotationRect: msg.elementRect || null,
        clickX: msg.x,
        clickY: msg.y,
        elementRect: msg.elementRect,
        url: msg.url,
        timestamp: Date.now()
      };

      sessionSteps.push(step);
      chrome.runtime.sendMessage({ action: "STEP_ADDED", step }).catch(() => {});
      sendResponse({ ok: true, step });
    });
    return true;
  }

  if (msg.action === "CAPTURE_MANUAL_SCREENSHOT") {
    if (!msg.tabId || (recordingTabId && msg.tabId !== recordingTabId)) {
      sendResponse({ ok: false, error: "Screenshot capture is not active for this tab." });
      return;
    }

    chrome.tabs.captureVisibleTab(msg.windowId, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }

      const stepNumber = sessionSteps.length + 1;
      const step = {
        id: crypto.randomUUID(),
        stepNumber,
        title: `Screenshot ${stepNumber}`,
        description: `Captured screenshot ${stepNumber}`,
        type: "screenshot",
        screenshotDataUrl: dataUrl,
        annotatedScreenshotDataUrl: dataUrl,
        annotationRect: null,
        clickX: null,
        clickY: null,
        elementRect: null,
        url: msg.url || "",
        timestamp: Date.now()
      };

      sessionSteps.push(step);
      chrome.runtime.sendMessage({ action: "STEP_ADDED", step }).catch(() => {});
      sendResponse({ ok: true, step });
    });
    return true;
  }

  if (msg.action === "GET_SESSION") {
    sendResponse({
      steps: sessionSteps,
      title: sessionGuideTitle,
      recording: Boolean(recordingTabId),
      recordingTabId
    });
    return;
  }

  if (msg.action === "ADD_VIDEO_STEP") {
    if (msg.step) {
      sessionSteps.push(msg.step);
      sessionSteps.forEach((step, index) => {
        step.stepNumber = index + 1;
      });
    }
    sendResponse({ ok: true, steps: sessionSteps });
    return;
  }

  if (msg.action === "UPDATE_STEP_ANNOTATION") {
    const step = sessionSteps.find((item) => item.id === msg.stepId);
    if (step) {
      step.annotationRect = msg.annotationRect;
      step.annotatedScreenshotDataUrl = msg.annotatedDataUrl;
    }
    sendResponse({ ok: true });
    return;
  }

  if (msg.action === "DELETE_STEP") {
    sessionSteps = sessionSteps.filter((step) => step.id !== msg.stepId);
    sessionSteps.forEach((step, index) => {
      step.stepNumber = index + 1;
    });
    sendResponse({ ok: true });
    return;
  }

  if (msg.action === "CLEAR_SESSION") {
    sessionSteps = [];
    sendResponse({ ok: true });
  }
});
