chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Eye Tracker extension with WebGazer installed');
    chrome.storage.local.set({isTracking: false});
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'requestCamera') {
    // Forward to offscreen document
    chrome.runtime.sendMessage(
      {action: 'requestCamera'},
      (response) => {
        sendResponse(response);
      }
    );
    return true;
  } else if (request.action === 'releaseCamera') {
    chrome.runtime.sendMessage(
      {action: 'releaseCamera'},
      (response) => {
        sendResponse(response);
      }
    );
    return true;
  } else if (request.action === 'startTracking') {
    chrome.storage.local.set({isTracking: true});
  } else if (request.action === 'stopTracking') {
    chrome.storage.local.set({isTracking: false});
  }
});