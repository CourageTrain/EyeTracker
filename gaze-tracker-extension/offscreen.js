let mediaStream = null;

console.log('Offscreen document loaded');

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('Offscreen: Received message:', request.action);
  
  if (request.action === 'requestCamera') {
    try {
      console.log('Offscreen: Requesting camera access...');
      
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 }
        },
        audio: false
      });
      
      console.log('✓ Offscreen: Camera access granted');
      sendResponse({success: true});
      
    } catch (err) {
      console.error('✗ Offscreen: Camera access failed:', err.name, err.message);
      sendResponse({success: false, error: err.message});
    }
  } else if (request.action === 'releaseCamera') {
    console.log('Offscreen: Releasing camera');
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      mediaStream = null;
    }
    sendResponse({success: true});
  }
  
  return true;
});

console.log('Offscreen listeners registered');