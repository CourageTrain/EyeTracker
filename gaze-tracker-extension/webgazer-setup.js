// Load WebGazer library into the page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('lib/webgazer.js');
script.onload = () => {
  console.log('WebGazer library loaded');
};
(document.head || document.documentElement).appendChild(script);