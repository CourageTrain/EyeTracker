let mediaStream = null;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'requestCamera') {
    try {
      console.log('Requesting camera access from offscreen...');
      
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 }
        },
        audio: false
      });
      
      console.log('✓ Camera access granted in offscreen');
      sendResponse({success: true});
      
    } catch (err) {
      console.error('✗ Camera access failed:', err);
      sendResponse({success: false, error: err.message});
    }
  } else if (request.action === 'releaseCamera') {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
      console.log('Camera released');
    }
    sendResponse({success: true});
  }
});