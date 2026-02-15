const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const errorMessage = document.getElementById('errorMessage');

startBtn.addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (!tabs[0]) return;
    
    chrome.tabs.sendMessage(tabs[0].id, {action: 'startTracking'}, (response) => {
      if (chrome.runtime.lastError) {
        showError('Failed to start tracking. Refresh the page and try again.');
        return;
      }
      
      if (response && response.success) {
        updateStatus('Tracking...', 'tracking');
        startBtn.disabled = true;
        stopBtn.disabled = false;
        hideError();
      }
    });
  });
});

stopBtn.addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (!tabs[0]) return;
    
    chrome.tabs.sendMessage(tabs[0].id, {action: 'stopTracking'}, (response) => {
      if (chrome.runtime.lastError) {
        return;
      }
      
      if (response && response.success) {
        updateStatus('Stopped', 'stopped');
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resetGazeData();
      }
    });
  });
});

// Listen for gaze data updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateGaze') {
    document.getElementById('gazeX').textContent = Math.round(request.x);
    document.getElementById('gazeY').textContent = Math.round(request.y);
    document.getElementById('confidence').textContent = (request.confidence * 100).toFixed(1);
  } else if (request.action === 'trackingError') {
    showError(request.error);
    startBtn.disabled = false;
    stopBtn.disabled = true;
    updateStatus('Error', 'ready');
  }
});

function updateStatus(text, statusClass) {
  status.className = 'status status-' + statusClass;
  status.innerHTML = `<span class="status-dot"></span>${text}`;
}

function resetGazeData() {
  document.getElementById('gazeX').textContent = '--';
  document.getElementById('gazeY').textContent = '--';
  document.getElementById('confidence').textContent = '--';
}

function showError(message) {
  errorMessage.textContent = '❌ ' + message;
  errorMessage.style.display = 'block';
}

function hideError() {
  errorMessage.style.display = 'none';
}

// Check if tracking is active on page load
window.addEventListener('load', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (!tabs[0]) return;
    
    chrome.storage.local.get(['isTracking'], (result) => {
      if (result.isTracking) {
        updateStatus('Tracking...', 'tracking');
        startBtn.disabled = true;
        stopBtn.disabled = false;
      }
    });
  });
});