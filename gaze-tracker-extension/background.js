chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Eye Tracker extension with WebGazer installed');
    chrome.storage.local.set({isTracking: false});
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTracking') {
    chrome.storage.local.set({isTracking: true});
  } else if (request.action === 'stopTracking') {
    chrome.storage.local.set({isTracking: false});
  }
});