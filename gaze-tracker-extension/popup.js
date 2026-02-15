// In popup.js
document.getElementById('start-btn').addEventListener('click', async () => {
  try {
    // 1. Request permission in the visible popup first
    await navigator.mediaDevices.getUserMedia({ video: true });
    
    // 2. Once granted, tell the background script to start the offscreen doc
    chrome.runtime.sendMessage({ type: 'START_TRACKING' });
    
    window.close(); // Close popup after success
  } catch (err) {
    console.error("Camera access denied by user.", err);
  }
});