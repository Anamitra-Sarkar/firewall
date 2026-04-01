/**
 * AI-NGFW Popup Script
 * Displays threat statistics and controls
 */

// DOM Elements
const blockedCountEl = document.getElementById('blockedCount');
const totalRequestsEl = document.getElementById('totalRequests');
const blockRateEl = document.getElementById('blockRate');
const threatListEl = document.getElementById('threatList');
const resetBtn = document.getElementById('resetBtn');
const settingsBtn = document.getElementById('settingsBtn');
const aboutLink = document.getElementById('aboutLink');

// Store threat history for display
let threatHistory = [];

/**
 * Update popup with current stats from background script
 */
async function updateStats() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getStats' }, (stats) => {
      if (chrome.runtime.lastError) {
        console.error('[AI-NGFW] Error getting stats:', chrome.runtime.lastError);
        resolve();
        return;
      }

      const { blocked, total } = stats;

      // Update DOM
      blockedCountEl.textContent = blocked;
      totalRequestsEl.textContent = total;

      // Calculate block rate
      const blockRate = total > 0 ? Math.round((blocked / total) * 100) : 0;
      blockRateEl.textContent = `${blockRate}%`;

      // Update threat list
      updateThreatList(stats.lastBlocked);

      resolve();
    });
  });
}

/**
 * Update threat list display
 */
function updateThreatList(lastBlocked) {
  if (!lastBlocked && threatHistory.length === 0) {
    threatListEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✓</div>
        <div class="empty-text">All clear! No threats detected.</div>
      </div>
    `;
    return;
  }

  // Build threat items
  let html = '';

  // Add last blocked if available
  if (lastBlocked) {
    html += createThreatItemHTML(lastBlocked);
  }

  // Add historical threats from local storage
  chrome.storage.local.get('threatHistory', (result) => {
    const history = result.threatHistory || [];
    
    // Show recent threats (limit to 10)
    const recentThreats = history.slice(-9);
    recentThreats.reverse();
    
    recentThreats.forEach((threat) => {
      html += createThreatItemHTML(threat);
    });

    if (html === '') {
      threatListEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✓</div>
          <div class="empty-text">All clear! No threats detected.</div>
        </div>
      `;
    } else {
      threatListEl.innerHTML = html;
    }
  });
}

/**
 * Create HTML for a single threat item
 */
function createThreatItemHTML(threat) {
  const timestamp = threat.timestamp || Date.now();
  const timeAgo = getTimeAgoString(timestamp);
  const domain = threat.domain || 'Unknown Domain';
  const reason = threat.reason || 'Suspicious Activity';

  return `
    <div class="threat-item">
      <div class="threat-icon">⚠️</div>
      <div class="threat-details">
        <div class="threat-domain">${escapeHtml(domain)}</div>
        <div class="threat-reason">${escapeHtml(reason)}</div>
        <div class="threat-time">${timeAgo}</div>
      </div>
    </div>
  `;
}

/**
 * Convert timestamp to "X minutes ago" format
 */
function getTimeAgoString(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Handle reset stats button
 */
resetBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset threat statistics?')) {
    chrome.runtime.sendMessage({ action: 'resetStats' }, (response) => {
      if (response.success) {
        threatListEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">✓</div>
            <div class="empty-text">Stats reset. All clear!</div>
          </div>
        `;
        blockedCountEl.textContent = '0';
        totalRequestsEl.textContent = '0';
        blockRateEl.textContent = '0%';
        
        // Clear threat history
        chrome.storage.local.set({ threatHistory: [] });
      }
    });
  }
});

/**
 * Handle settings button
 */
settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

/**
 * Handle about link
 */
aboutLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'https://github.com' });
});

/**
 * Store threat in history when blocked
 */
function storeThreatInHistory(threat) {
  chrome.storage.local.get('threatHistory', (result) => {
    const history = result.threatHistory || [];
    history.push(threat);
    
    // Keep only last 50 threats
    if (history.length > 50) {
      history.shift();
    }
    
    chrome.storage.local.set({ threatHistory: history });
  });
}

/**
 * Listen for new threats from background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'threatBlocked') {
    storeThreatInHistory(request.threat);
    updateStats();
  }
});

/**
 * Refresh stats every 2 seconds
 */
let updateInterval;

function startAutoUpdate() {
  updateStats();
  updateInterval = setInterval(updateStats, 2000);
}

function stopAutoUpdate() {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  startAutoUpdate();
});

// Clean up on popup close
window.addEventListener('unload', () => {
  stopAutoUpdate();
});

console.log('[AI-NGFW] Popup script loaded');
