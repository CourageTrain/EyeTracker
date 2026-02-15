// In offscreen.js
async function startGazeEngine() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  // Start your tracking library (WebGazer, etc.) with the stream
}
startGazeEngine();