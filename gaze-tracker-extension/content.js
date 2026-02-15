let isTracking = false;
let animationFrameId = null;

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
  
  // Request camera permission
  navigator.mediaDevices.getUserMedia({video: true})
    .then(stream => {
      console.log('Camera access granted');
      // Load and initialize eye tracking library (e.g., webgazer.js)
      initializeWebGazer(stream);
    })
    .catch(err => {
      console.error('Camera access denied:', err);
      isTracking = false;
    });
}

function stopEyeTracking() {
  isTracking = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
}

function initializeWebGazer(stream) {
  // This is a simplified example
  // For a real implementation, integrate webgazer.js library
  trackGaze();
}

function trackGaze() {
  if (!isTracking) return;
  
  // Simulate gaze tracking (replace with actual eye tracking library)
  const gazeData = {
    action: 'updateGaze',
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    confidence: Math.random()
  };
  
  chrome.runtime.sendMessage(gazeData);
  animationFrameId = requestAnimationFrame(trackGaze);
}