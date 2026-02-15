let isTracking = false;
let webgazerInitialized = false;

function waitForWebGazer(maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkWebGazer = setInterval(() => {
      attempts++;
      console.log(`Checking for WebGazer... attempt ${attempts}`);
      
      if (window.webgazer) {
        clearInterval(checkWebGazer);
        console.log('✓ WebGazer found!');
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkWebGazer);
        reject(new Error('WebGazer failed to load after 30 attempts'));
      }
    }, 200);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTracking') {
    startEyeTracking().then(() => {
      sendResponse({success: true});
    }).catch(err => {
      console.error('Start tracking error:', err);
      sendResponse({success: false, error: err.message});
    });
    return true; // Keep message channel open
  } else if (request.action === 'stopTracking') {
    stopEyeTracking();
    sendResponse({success: true});
  }
});

async function startEyeTracking() {
  isTracking = true;
  
  try {
    console.log('Waiting for WebGazer...');
    await waitForWebGazer();
    
    if (webgazerInitialized) {
      console.log('Resuming WebGazer');
      window.webgazer.resume();
      showGazeCursor();
      return;
    }

    console.log('Initializing WebGazer...');
    
    await window.webgazer
      .setRegression('ridge')
      .setTracker('clmtrackr')
      .begin();
    
    console.log('✓ WebGazer initialized successfully');
    webgazerInitialized = true;
    
    // Set up gaze prediction callback
    window.webgazer.setGazeListener((data, elapsedTime) => {
      if (data == null) return;
      
      chrome.runtime.sendMessage({
        action: 'updateGaze',
        x: data.x,
        y: data.y,
        confidence: data.confidence || 0
      }).catch(() => {});
    });
    
    showGazeCursor();
    
  } catch (err) {
    console.error('WebGazer initialization failed:', err);
    isTracking = false;
    throw err;
  }
}

function stopEyeTracking() {
  isTracking = false;
  
  if (window.webgazer && webgazerInitialized) {
    window.webgazer.pause();
  }
  
  removeGazeCursor();
}

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

document.addEventListener('visibilitychange', () => {
  if (document.hidden && isTracking && window.webgazer) {
    window.webgazer.pause();
  } else if (!document.hidden && isTracking && window.webgazer) {
    window.webgazer.resume();
  }
});

window.addEventListener('beforeunload', () => {
  if (window.webgazer && webgazerInitialized) {
    window.webgazer.end();
    webgazerInitialized = false;
  }
});