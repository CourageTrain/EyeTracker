// Wait for document to be ready then load WebGazer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadWebGazer);
} else {
  loadWebGazer();
}

function loadWebGazer() {
  if (window.webgazer) return;
  
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
  
  script.onload = () => {
    console.log('✓ WebGazer loaded from CDN');
    window.dispatchEvent(new Event('webgazer-loaded'));
  };
  
  script.onerror = () => {
    console.error('✗ Failed to load WebGazer from CDN');
  };
  
  document.head.appendChild(script);
}