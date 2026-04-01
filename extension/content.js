/**
 * AI-NGFW Content Script
 * Monitors page behavior for malicious activities
 */

const BEHAVIORAL_SIGNALS = {
  redirectChain: [],
  externalRequests: 0,
  paymentFormsDetected: 0,
  creditCardFormDetected: false,
  suspiciousEventListeners: 0,
};

/**
 * Monitor for behavioral signals of compromise
 */

// Detect redirect chains
document.addEventListener('beforeunload', () => {
  BEHAVIORAL_SIGNALS.redirectChain.push({
    from: document.location.href,
    timestamp: Date.now(),
  });
});

// Monitor external requests
window.addEventListener('load', () => {
  const externalDomains = new Set();
  
  // Check all images
  document.querySelectorAll('img').forEach((img) => {
    if (img.src) {
      const url = new URL(img.src, document.location.href);
      if (url.hostname !== document.location.hostname) {
        externalDomains.add(url.hostname);
      }
    }
  });

  // Check all scripts
  document.querySelectorAll('script').forEach((script) => {
    if (script.src) {
      const url = new URL(script.src, document.location.href);
      if (url.hostname !== document.location.hostname) {
        externalDomains.add(url.hostname);
      }
    }
  });

  BEHAVIORAL_SIGNALS.externalRequests = externalDomains.size;
});

// Detect payment forms (credit cards, banking)
document.addEventListener('DOMContentLoaded', () => {
  // Look for credit card patterns
  const paymentInputs = document.querySelectorAll(
    'input[type="text"][name*="card"], input[type="text"][name*="credit"], input[placeholder*="card"], input[placeholder*="credit"]'
  );
  
  if (paymentInputs.length > 0) {
    BEHAVIORAL_SIGNALS.paymentFormsDetected = paymentInputs.length;
    
    // Check if this looks like a legitimate payment form
    const ssl = document.location.protocol === 'https:';
    if (!ssl) {
      BEHAVIORAL_SIGNALS.creditCardFormDetected = true;
      console.warn('[AI-NGFW] Potential phishing: Credit card form on non-HTTPS site');
      sendBehavioralSignal('payment_form_non_https');
    }
  }
});

/**
 * Send behavioral signals to background script
 */
function sendBehavioralSignal(signal) {
  chrome.runtime.sendMessage({
    action: 'behavioralSignal',
    signal: signal,
    url: document.location.href,
  });
}

/**
 * Monitor for suspicious eval() usage
 */
const originalEval = window.eval;
window.eval = function(...args) {
  BEHAVIORAL_SIGNALS.suspiciousEventListeners++;
  console.warn('[AI-NGFW] Suspicious eval() detected:', args[0]?.substring(0, 100));
  sendBehavioralSignal('eval_detected');
  return originalEval.apply(this, args);
};

/**
 * Monitor for suspicious fetch requests
 */
const originalFetch = window.fetch;
window.fetch = function(url, ...args) {
  // Check if fetching from unusual domain
  if (typeof url === 'string') {
    const requestUrl = new URL(url, document.location.href);
    if (requestUrl.hostname !== document.location.hostname && 
        !isKnownCDN(requestUrl.hostname)) {
      console.log('[AI-NGFW] Cross-origin fetch:', requestUrl.hostname);
    }
  }
  return originalFetch.apply(this, args);
};

/**
 * Check if domain is a known CDN
 */
function isKnownCDN(domain) {
  const knownCDNs = [
    'cloudflare.com',
    'cloudfront.amazonaws.com',
    'akamai.com',
    'fastly.com',
    'cdn.jsdelivr.net',
    'unpkg.com',
    'cdnjs.cloudflare.com',
  ];
  
  return knownCDNs.some((cdn) => domain.includes(cdn));
}

/**
 * Listen for messages from background
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getBehavioralSignals') {
    sendResponse(BEHAVIORAL_SIGNALS);
  } else if (request.action === 'pageAnalysis') {
    sendResponse({
      signals: BEHAVIORAL_SIGNALS,
      url: document.location.href,
      title: document.title,
    });
  }
});

console.log('[AI-NGFW] Content script loaded');
