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
    // Request camera permission
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    })
      .then(stream => {
        console.log('Camera access granted');
        initializeWebGazer();
      })
      .catch(err => {
        console.error('Camera access denied:', err);
        isTracking = false;
        chrome.runtime.sendMessage({
          action: 'trackingError',
          error: 'Camera access denied'
        }).catch(() => {});
      });
  });
}

function initializeWebGazer() {
  if (webgazerInitialized) {
    window.webgazer.resume();
    trackGaze();
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
      
      // Optional: Show gaze cursor on page
      showGazeCursor();
      trackGaze();
    })
    .catch(err => {
      console.error('WebGazer initialization failed:', err);
      isTracking = false;
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

function trackGaze() {
  if (!isTracking) return;
  
  animationFrameId = requestAnimationFrame(trackGaze);
}

// Visual gaze cursor (optional)
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
  `;
  document.body.appendChild(cursor);
  
  // Update cursor position with gaze data
  window.webgazer.setGazeListener((data, elapsedTime) => {
    if (data == null) return;
    
    const cursorElement = document.getElementById('webgazer-cursor');
    if (cursorElement) {
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
  if (window.webgazer) {
    window.webgazer.end();
  }
});