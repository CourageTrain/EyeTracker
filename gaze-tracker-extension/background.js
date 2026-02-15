// Background service worker for the extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Eye Tracker extension installed');
  }
});

// Handle any global extension events here
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle messages from content scripts
  console.log('Message received:', request);
});