// In background.js
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'START_TRACKING') {
    ensureOffscreen(); // Only run this AFTER user clicks the popup button
  }
  
  if (msg.type === 'GAZE_DATA') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, msg);
    });
  }
});
// Ensure offscreen doc is ready on install
chrome.runtime.onInstalled.addListener(ensureOffscreen);

// Listen for gaze data from offscreen.js and send it to content.js
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'GAZE_DATA') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, msg);
    });
  }
});
