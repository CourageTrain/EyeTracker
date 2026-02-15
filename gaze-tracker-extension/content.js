let isTracking = false;
let webgazerInitialized = false;
let animationFrameId = null;

// Wait for WebGazer to be available
function waitForWebGazer(callback) {
  if (window.webgazer) {
    callback();
  } else {
    setTimeout(() => waitForWebGazer(callback), 100);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTracking') {
    if (!isTracking) {
      startEyeTracking();
      sendResponse({success: true});
    }
  } else if (request.action === 'stopTracking') {
    if (isTracking) {
      stopEyeTracking();
      sendResponse({success: true});
    }
  }
});

function startEyeTracking() {
  isTracking = true;
  
  waitForWebGazer(() => {
    if (webgazerInitialized) {
      console.log('Resuming WebGazer');
      window.webgazer.resume();
      showGazeCursor();
      return;
    }

    // Initialize WebGazer with default settings
    window.webgazer
      .setRegression('ridge')
      .setTracker('clmtrackr')
      .begin()
      .then(() => {
        console.log('WebGazer initialized successfully');
        webgazerInitialized = true;
        
        // Set up gaze prediction callback
        window.webgazer.setGazeListener((data, elapsedTime) => {
          if (data == null) return;
          
          // Send gaze data to popup
          chrome.runtime.sendMessage({
            action: 'updateGaze',
            x: data.x,
            y: data.y,
            confidence: data.confidence || 0
          }).catch(() => {
            // Silently handle errors when popup is not open
          });
        });
        
        // Show gaze cursor on page
        showGazeCursor();
      })
      .catch(err => {
        console.error('WebGazer initialization failed:', err);
        isTracking = false;
        chrome.runtime.sendMessage({
          action: 'trackingError',
          error: 'WebGazer failed to initialize: ' + err.message
        }).catch(() => {});
      });
  });
}

function stopEyeTracking() {
  isTracking = false;
  
  if (window.webgazer && webgazerInitialized) {
    window.webgazer.pause();
  }
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  // Remove gaze cursor
  removeGazeCursor();
}

// Visual gaze cursor
function showGazeCursor() {
  if (document.getElementById('webgazer-cursor')) return;
  
  const cursor = document.createElement('div');
  cursor.id = 'webgazer-cursor';
  cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    background-color: rgba(255, 0, 0, 0.3);
    border: 2px solid red;
    border-radius: 50%;
    pointer-events: none;
    z-index: 10000;
    display: none;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  `;
  document.body.appendChild(cursor);
  
  // Update cursor position with gaze data
  window.webgazer.setGazeListener((data, elapsedTime) => {
    if (data == null) return;
    
    const cursorElement = document.getElementById('webgazer-cursor');
    if (cursorElement && isTracking) {
      cursorElement.style.left = (data.x - 10) + 'px';
      cursorElement.style.top = (data.y - 10) + 'px';
      cursorElement.style.display = 'block';
    }
  });
}

function removeGazeCursor() {
  const cursor = document.getElementById('webgazer-cursor');
  if (cursor) {
    cursor.remove();
  }
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden && isTracking) {
    if (window.webgazer) {
      window.webgazer.pause();
    }
  } else if (!document.hidden && isTracking) {
    if (window.webgazer) {
      window.webgazer.resume();
    }
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (window.webgazer && webgazerInitialized) {
    window.webgazer.end();
    webgazerInitialized = false;
  }
});