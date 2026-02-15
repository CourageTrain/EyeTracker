chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Eye Tracker extension with WebGazer installed');
    chrome.storage.local.set({isTracking: false});
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'requestCamera') {
    console.log('Background: Requesting camera via offscreen');
    
    // Create or get offscreen document
    createOffscreenDocument()
      .then(() => {
        console.log('Background: Offscreen document ready, requesting camera');
        
        // Send message to offscreen document and wait for response
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            {action: 'requestCamera'},
            (response) => {
              if (chrome.runtime.lastError) {
                console.error('Background: Chrome error:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
              } else {
                console.log('Background: Camera response:', response);
                resolve(response);
              }
            }
          );
        });
      })
      .then((response) => {
        sendResponse(response);
      })
      .catch((err) => {
        console.error('Background: Error:', err);
        sendResponse({success: false, error: err.message});
      });
    
    return true; // Keep channel open
    
  } else if (request.action === 'releaseCamera') {
    console.log('Background: Releasing camera');
    
    chrome.runtime.sendMessage(
      {action: 'releaseCamera'},
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Background: Release error:', chrome.runtime.lastError);
        }
        sendResponse(response || {success: true});
      }
    );
    return true;
    
  } else if (request.action === 'startTracking') {
    chrome.storage.local.set({isTracking: true});
  } else if (request.action === 'stopTracking') {
    chrome.storage.local.set({isTracking: false});
  }
});

// Create offscreen document if it doesn't exist
async function createOffscreenDocument() {
  // Check if offscreen document already exists
  try {
    if (chrome.runtime.getContexts) {
      const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
      });
      
      if (existingContexts.length > 0) {
        console.log('Offscreen document already exists');
        return;
      }
    }
  } catch (err) {
    console.log('getContexts not available, will create new document');
  }
  
  console.log('Creating offscreen document...');
  
  if (!chrome.offscreen) {
    throw new Error('chrome.offscreen API not available. Make sure "offscreen" permission is in manifest.json');
  }
  
  return chrome.offscreen.createDocument({
    url: chrome.runtime.getURL('offscreen.html'),
    reasons: ['USER_MEDIA'],
    justification: 'Access camera for eye tracking functionality'
  });
}