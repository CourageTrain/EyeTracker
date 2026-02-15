// Load WebGazer library from CDN into the page context
(function() {
  if (window.webgazer) return;
  
  const script = document.createElement('script');
  script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
  script.onload = () => {
    console.log('WebGazer library loaded successfully from CDN');
  };
  script.onerror = () => {
    console.error('Failed to load WebGazer library from CDN');
  };
  document.head.appendChild(script);
})();