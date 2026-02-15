let mediaStream = null;

console.log('✓ Offscreen document loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Offscreen: Received message:', request.action);
  
  if (request.action === 'requestCamera') {
    handleCameraRequest(sendResponse);
    return true; // Keep the message channel open
  } else if (request.action === 'releaseCamera') {
    handleReleaseCamera(sendResponse);
    return true;
  }
});

async function handleCameraRequest(sendResponse) {
  try {
    console.log('📹 Offscreen: Requesting camera access...');
    
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 320 },
        height: { ideal: 240 }
      },
      audio: false
    });
    
    console.log('✅ Offscreen: Camera access granted');
    console.log('📊 Stream tracks:', mediaStream.getTracks().length);
    
    sendResponse({success: true, message: 'Camera access granted'});
    
  } catch (err) {
    console.error('❌ Offscreen: Camera access failed');
    console.error('   Error name:', err.name);
    console.error('   Error message:', err.message);
    
    sendResponse({
      success: false, 
      error: err.message,
      errorName: err.name
    });
  }
}

function handleReleaseCamera(sendResponse) {
  console.log('🔌 Offscreen: Releasing camera');
  
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => {
      console.log('   Stopping track:', track.kind, '- enabled:', track.enabled);
      track.stop();
    });
    mediaStream = null;
    console.log('✓ Camera released');
  } else {
    console.log('⚠️ No media stream to release');
  }
  
  sendResponse({success: true});
}

console.log('✓ Offscreen listeners registered');