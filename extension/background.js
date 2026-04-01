/**
 * AI-NGFW Service Worker
 * Monitors network requests and detects threats in real-time
 */

// Configuration
const CONFIG = {
  BACKEND_URL: 'http://localhost:7860',
  CACHE_TTL: 3600000, // 1 hour
  REQUEST_TIMEOUT: 5000,
  THREAT_THRESHOLD: 0.7,
};

// In-memory threat cache for instant decisions
const threatCache = new Map();
const threatStats = {
  blocked: 0,
  total: 0,
  lastBlocked: null,
};

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[AI-NGFW] Extension installed, opening setup wizard');
    chrome.tabs.create({ url: 'setup.html' });
  }
});

/**
 * Get backend URL from storage or use default
 */
async function getBackendUrl() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('backendUrl', (result) => {
      resolve(result.backendUrl || CONFIG.BACKEND_URL);
    });
  });
}

/**
 * Analyze a request for threats
 */
async function analyzeRequest(request) {
  const { url, tabId, method } = request;
  
  try {
    // Check cache first (instant decision)
    const cachedResult = threatCache.get(url);
    if (cachedResult && Date.now() - cachedResult.timestamp < CONFIG.CACHE_TTL) {
      console.log(`[AI-NGFW] Cache hit for ${url}: ${cachedResult.isBlocked ? 'BLOCKED' : 'ALLOWED'}`);
      return cachedResult;
    }

    // Extract domain and protocol
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const protocol = urlObj.protocol;

    // Skip extension and browser protocols
    if (['chrome:', 'chrome-extension:', 'about:', 'blob:'].includes(protocol)) {
      return { isBlocked: false, reason: 'Safe protocol', isThreating: false };
    }

    // Prepare request analysis payload
    const analysisPayload = {
      url: url,
      domain: domain,
      protocol: protocol,
      method: method,
      timestamp: new Date().toISOString(),
      tabId: tabId,
    };

    // Get backend URL
    const backendUrl = await getBackendUrl();
    
    // Send to backend for AI analysis
    const response = await fetch(`${backendUrl}/api/v1/incidents/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analysisPayload),
      signal: AbortSignal.timeout(CONFIG.REQUEST_TIMEOUT),
    });

    if (!response.ok) {
      console.error(`[AI-NGFW] Backend error: ${response.status}`);
      // On error, allow the request (fail open)
      return { isBlocked: false, reason: 'Analysis unavailable', isThreating: false };
    }

    const analysisResult = await response.json();
    
    // Cache the result
    const result = {
      isBlocked: analysisResult.threat_score > CONFIG.THREAT_THRESHOLD,
      reason: analysisResult.threat_type || 'Unknown',
      threatScore: analysisResult.threat_score,
      timestamp: Date.now(),
    };

    threatCache.set(url, result);

    // Update stats
    threatStats.total++;
    if (result.isBlocked) {
      threatStats.blocked++;
      threatStats.lastBlocked = {
        domain: domain,
        timestamp: Date.now(),
        reason: result.reason,
      };
      console.log(`[AI-NGFW] BLOCKED: ${domain} - ${result.reason}`);
    }

    // Update badge
    updateBadge();

    return result;

  } catch (error) {
    console.error('[AI-NGFW] Analysis error:', error);
    // Fail open - allow request if analysis fails
    return { isBlocked: false, reason: 'Analysis failed', isThreating: false };
  }
}

/**
 * Update extension badge with threat count
 */
async function updateBadge() {
  if (threatStats.blocked > 0) {
    chrome.action.setBadgeText({ text: String(threatStats.blocked) });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

/**
 * Intercept web requests using the webRequest API alternative
 * Note: Chrome 88+ uses declarativeNetRequest for performance
 */
chrome.webRequest.onBeforeSendHeaders.addListener(
  async (details) => {
    // Analyze the request
    const analysis = await analyzeRequest({
      url: details.url,
      tabId: details.tabId,
      method: details.method,
    });

    // If threat detected, cancel the request
    if (analysis.isBlocked) {
      console.log(`[AI-NGFW] Cancelling request to ${details.url}`);
      return { cancel: true };
    }

    return {};
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);

/**
 * Listen for messages from content script and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    sendResponse({
      blocked: threatStats.blocked,
      total: threatStats.total,
      lastBlocked: threatStats.lastBlocked,
    });
  } else if (request.action === 'resetStats') {
    threatStats.blocked = 0;
    threatStats.total = 0;
    threatStats.lastBlocked = null;
    updateBadge();
    sendResponse({ success: true });
  } else if (request.action === 'setBackendUrl') {
    chrome.storage.sync.set({ backendUrl: request.url }, () => {
      sendResponse({ success: true });
    });
  } else if (request.action === 'getBackendUrl') {
    getBackendUrl().then((url) => {
      sendResponse({ backendUrl: url });
    });
  } else if (request.action === 'cacheClear') {
    threatCache.clear();
    sendResponse({ success: true });
  }
});

/**
 * Handle tab updates - reset stats on new tab
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
  // Could implement per-tab threat tracking here
});

/**
 * Periodic cache cleanup
 */
setInterval(() => {
  const now = Date.now();
  for (const [url, result] of threatCache.entries()) {
    if (now - result.timestamp > CONFIG.CACHE_TTL) {
      threatCache.delete(url);
    }
  }
  console.log(`[AI-NGFW] Cache cleanup: ${threatCache.size} entries remaining`);
}, 300000); // 5 minutes

console.log('[AI-NGFW] Service worker initialized');
