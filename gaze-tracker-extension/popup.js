const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const errorMessage = document.getElementById('errorMessage');

let cameraGranted = false;

startBtn.addEventListener('click', () => {
  console.log('Start button clicked');
  requestCameraViaOffscreen();
});

stopBtn.addEventListener('click', () => {
  console.log('Stop button clicked');
  
  // Release camera
  chrome.runtime.sendMessage({action: 'releaseCamera'}, () => {});
  
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (!tabs[0]) return;
    
    chrome.tabs.sendMessage(tabs[0].id, {action: 'stopTracking'}, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error stopping tracking:', chrome.runtime.lastError);
        return;
      }
      
      if (response && response.success) {
        updateStatus('Stopped', 'stopped');
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resetGazeData();
        cameraGranted = false;
      }
    });
  });
});

function requestCameraViaOffscreen() {
  console.log('Requesting camera via offscreen document...');
  
  chrome.runtime.sendMessage(
    {action: 'requestCamera'},
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('Offscreen error:', chrome.runtime.lastError);
        showError('Failed to access camera. Check Chrome permissions.');
        return;
      }
      
      if (response && response.success) {
        console.log('✓ Camera access granted');
        cameraGranted = true;
        startEyeTrackingOnTab();
      } else {
        console.error('Camera denied:', response?.error);
        showError('Camera access denied: ' + (response?.error || 'Unknown error'));
      }
    }
  );
}

function startEyeTrackingOnTab() {
  console.log('Starting eye tracking on active tab...');
  
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (!tabs[0]) {
      showError('No active tab found');
      return;
    }
    
    console.log('Active tab:', tabs[0].url);
    
    chrome.tabs.sendMessage(tabs[0].id, {action: 'startTracking'}, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error:', chrome.runtime.lastError.message);
        showError('Failed to connect to page. Refresh and try again.');
        return;
      }
      
      if (response && response.success) {
        console.log('✓ Tracking started successfully');
        updateStatus('Tracking...', 'tracking');
        startBtn.disabled = true;
        stopBtn.disabled = false;
        hideError();
      } else if (response && response.error) {
        console.error('Tracking error:', response.error);
        showError(response.error);
      } else {
        console.error('No response from content script');
        showError('Failed to start tracking. Refresh and try again.');
      }
    });
  });
}

// Listen for gaze data updates from content script
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
    cameraGranted = false;
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
  console.error('Error:', message);
  errorMessage.textContent = '❌ ' + message;
  errorMessage.style.display = 'block';
}

function hideError() {
  errorMessage.style.display = 'none';
}

// Check if tracking is active on page load
window.addEventListener('load', () => {
  chrome.storage.local.get(['isTracking'], (result) => {
    if (result.isTracking) {
      updateStatus('Tracking...', 'tracking');
      startBtn.disabled = true;
      stopBtn.disabled = false;
    }
  });
});