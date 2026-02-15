// background.js

// 1. Define the function BEFORE using it
async function ensureOffscreen() {
  const offscreenUrl = chrome.runtime.getURL('offscreen.html');
  const contexts = await chrome.runtime.getContexts({ 
    contextTypes: ['OFFSCREEN_DOCUMENT'] 
  });
  
  if (contexts.length === 0) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Eye-tracking camera processing'
    });
  }
}

// 2. Fix the message listener syntax
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'START_TRACKING') {
    ensureOffscreen();
  }
  
  if (msg.type === 'GAZE_DATA') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // FIX: Use tabs[0] to target the first active tab found
      if (tabs && tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, msg);
      }
    });
  }
  return true; // Keep the message channel open
});