document.getElementById('startBtn').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'startTracking'}, (response) => {
      if (response && response.success) {
        document.getElementById('status').textContent = 'Tracking...';
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
      }
    });
  });
});

document.getElementById('stopBtn').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'stopTracking'}, (response) => {
      if (response && response.success) {
        document.getElementById('status').textContent = 'Stopped';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('gazeX').textContent = '--';
        document.getElementById('gazeY').textContent = '--';
        document.getElementById('confidence').textContent = '--';
      }
    });
  });
});

// Listen for gaze data updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateGaze') {
    document.getElementById('gazeX').textContent = request.x.toFixed(2);
    document.getElementById('gazeY').textContent = request.y.toFixed(2);
    document.getElementById('confidence').textContent = request.confidence.toFixed(2);
  }
});