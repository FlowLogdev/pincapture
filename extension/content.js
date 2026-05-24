(function () {
  if (window.__pincaptureContentLoaded) return;
  window.__pincaptureContentLoaded = true;

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "PING") {
      sendResponse({ ok: true });
      return;
    }

    if (msg.action === "IMPORT_GUIDE") {
      window.postMessage({
        source: "pincapture-extension",
        type: "IMPORT_GUIDE",
        payload: msg.payload,
      }, window.location.origin);
      sendResponse({ ok: true });
    }
  });
})();
