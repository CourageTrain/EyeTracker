const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const errorMessage = document.getElementById('errorMessage');

let cameraGranted = false;

startBtn.addEventListener('click', () => {
  console.log('🔴 Start button clicked');
  startTracking();
});

stopBtn.addEventListener('click', () => {
  console.log('🛑 Stop button clicked');
  stopTracking();
});

async function startTracking() {
  try {
    console.log('📹 Requesting camera access from popup...');
    updateStatus('Requesting camera...', 'tracking');
    
    // Request camera access directly from popup
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 320 },
        height: { ideal: 240 }
      },
      audio: false
    });
    
    console.log('✅ Camera access granted!');
    
    // Stop the stream - we just needed to request permission
    stream.getTracks().forEach(track => track.stop());
    
    cameraGranted = true;
    
    // Now start tracking on the webpage
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (!tabs[0]) {
        showError('No active tab found');
        return;
      }
      
      console.log('👁️ Starting eye tracking on tab:', tabs[0].url);
      
      chrome.tabs.sendMessage(tabs[0].id, {action: 'startTracking'}, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Content script error:', chrome.runtime.lastError.message);
          showError('Failed to start tracking. Refresh the page and try again.');
          return;
        }
        
        if (response && response.success) {
          console.log('✓ Tracking started successfully');
          updateStatus('Tracking...', 'tracking');
          startBtn.disabled = true;
          stopBtn.disabled = false;
          hideError();
        } else if (response && response.error) {
          console.error('❌ Tracking error:', response.error);
          showError(response.error);
        } else {
          console.error('❌ No response from content script');
          showError('Failed to start tracking. Refresh the page and try again.');
        }
      });
    });
    
  } catch (err) {
    console.error('❌ Camera access failed:', err.name, err.message);
    
    if (err.name === 'NotAllowedError') {
      showError(
        'Camera permission denied.\n\n' +
        'To fix this:\n' +
        '1. Click the camera icon in the address bar\n' +
        '2. Change camera permission to "Allow"\n' +
        '3. Reload and try again'
      );
    } else if (err.name === 'NotFoundError') {
      showError('No camera found on this device');
    } else {
      showError('Camera error: ' + err.message);
    }
    
    updateStatus('Error', 'ready');
    startBtn.disabled = false;
  }
}

function stopTracking() {
  console.log('🛑 Stopping tracking...');
  
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
  console.error('🚨 Error:', message);
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