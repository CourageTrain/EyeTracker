const dot = document.createElement('div');
dot.id = 'gaze-dot';
document.body.appendChild(dot);

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
if (message.type === 'GAZE_DATA'){
const { x,y } = message.data;

dot.style.display = 'block';
dot.style.left = '${x}px';
dot.style.top = '${y}px';

}
});