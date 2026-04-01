/**
 * AI-NGFW Options Script
 * Handles settings page functionality
 */

// DOM Elements
const backendUrlInput = document.getElementById('backendUrl');
const enableProtectionToggle = document.getElementById('enableProtection');
const blockPhishingToggle = document.getElementById('blockPhishing');
const blockMalwareToggle = document.getElementById('blockMalware');
const enableNotificationsToggle = document.getElementById('enableNotifications');
const threatThresholdInput = document.getElementById('threatThreshold');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const statusMessage = document.getElementById('statusMessage');
const totalBlockedEl = document.getElementById('totalBlocked');
const totalAnalyzedEl = document.getElementById('totalAnalyzed');

// Default settings
const DEFAULT_SETTINGS = {
  backendUrl: 'http://localhost:7860',
  enableProtection: true,
  blockPhishing: true,
  blockMalware: true,
  enableNotifications: false,
  threatThreshold: 0.7,
};

/**
 * Load settings from Chrome storage
 */
function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    backendUrlInput.value = settings.backendUrl;
    enableProtectionToggle.checked = settings.enableProtection;
    blockPhishingToggle.checked = settings.blockPhishing;
    blockMalwareToggle.checked = settings.blockMalware;
    enableNotificationsToggle.checked = settings.enableNotifications;
    threatThresholdInput.value = settings.threatThreshold;

    // Load stats
    loadStats();
  });
}

/**
 * Load threat statistics
 */
function loadStats() {
  chrome.runtime.sendMessage({ action: 'getStats' }, (stats) => {
    if (chrome.runtime.lastError) {
      console.error('Error getting stats:', chrome.runtime.lastError);
      return;
    }

    totalBlockedEl.textContent = stats.blocked || 0;
    totalAnalyzedEl.textContent = stats.total || 0;
  });
}

/**
 * Save settings to Chrome storage
 */
function saveSettings() {
  const settings = {
    backendUrl: backendUrlInput.value.trim(),
    enableProtection: enableProtectionToggle.checked,
    blockPhishing: blockPhishingToggle.checked,
    blockMalware: blockMalwareToggle.checked,
    enableNotifications: enableNotificationsToggle.checked,
    threatThreshold: parseFloat(threatThresholdInput.value),
  };

  // Validate backend URL
  if (!settings.backendUrl) {
    showStatus('Backend URL cannot be empty', 'error');
    return;
  }

  try {
    new URL(settings.backendUrl);
  } catch (error) {
    showStatus('Invalid backend URL format', 'error');
    return;
  }

  // Validate threshold
  if (settings.threatThreshold < 0 || settings.threatThreshold > 1) {
    showStatus('Threat threshold must be between 0.0 and 1.0', 'error');
    return;
  }

  // Save to storage
  chrome.storage.sync.set(settings, () => {
    if (chrome.runtime.lastError) {
      showStatus('Error saving settings', 'error');
      return;
    }

    // Update background script
    chrome.runtime.sendMessage(
      { action: 'setBackendUrl', url: settings.backendUrl },
      (response) => {
        if (response.success) {
          showStatus('Settings saved successfully!', 'success');
        }
      }
    );
  });
}

/**
 * Reset settings to defaults
 */
function resetSettings() {
  if (!confirm('Reset all settings to default values?')) {
    return;
  }

  chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
    loadSettings();
    showStatus('Settings reset to defaults', 'success');
  });
}

/**
 * Show status message
 */
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;

  // Auto-hide after 4 seconds
  setTimeout(() => {
    statusMessage.className = 'status-message';
  }, 4000);
}

/**
 * Validate backend connection
 */
async function validateBackendConnection() {
  const url = backendUrlInput.value.trim();

  if (!url) {
    showStatus('Please enter a backend URL', 'error');
    return;
  }

  try {
    const response = await fetch(`${url}/`, { method: 'GET' });
    if (response.ok) {
      showStatus('Backend connection successful!', 'success');
    } else {
      showStatus(`Backend returned status ${response.status}`, 'error');
    }
  } catch (error) {
    showStatus('Cannot reach backend - check URL and ensure it is running', 'error');
  }
}

// Event Listeners
saveBtn.addEventListener('click', saveSettings);
resetBtn.addEventListener('click', resetSettings);

// Enter key to save
backendUrlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveSettings();
  }
});

threatThresholdInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveSettings();
  }
});

// Auto-save on toggle changes
enableProtectionToggle.addEventListener('change', saveSettings);
blockPhishingToggle.addEventListener('change', saveSettings);
blockMalwareToggle.addEventListener('change', saveSettings);
enableNotificationsToggle.addEventListener('change', saveSettings);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  // Refresh stats every 5 seconds
  setInterval(loadStats, 5000);
});

console.log('[AI-NGFW] Options script loaded');
