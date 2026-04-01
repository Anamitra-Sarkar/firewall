/**
 * AI-NGFW Setup Wizard Script
 * Guides users through initial configuration
 */

const TOTAL_STEPS = 4;
let currentStep = 1;

// DOM Elements
const progressFill = document.getElementById('progressFill');
const backendUrlInput = document.getElementById('backendUrl');
const testBtn = document.getElementById('testBtn');
const backendStatus = document.getElementById('backendStatus');

/**
 * Update progress bar
 */
function updateProgress() {
  const percentage = (currentStep / TOTAL_STEPS) * 100;
  progressFill.style.width = `${percentage}%`;
}

/**
 * Show step
 */
function showStep(step) {
  // Hide all steps
  document.querySelectorAll('.step').forEach((el) => {
    el.classList.remove('active');
  });

  // Show current step
  const stepEl = document.getElementById(`step${step}`);
  if (stepEl) {
    stepEl.classList.add('active');
  }

  updateProgress();
  window.scrollTo(0, 0);
}

/**
 * Next step
 */
function nextStep() {
  if (currentStep < TOTAL_STEPS) {
    currentStep++;
    showStep(currentStep);
  }
}

/**
 * Previous step
 */
function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

/**
 * Test backend connection
 */
async function testBackendConnection() {
  const url = backendUrlInput.value.trim();

  if (!url) {
    showBackendStatus('Please enter a backend URL', 'error');
    return;
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    showBackendStatus('Invalid URL format', 'error');
    return;
  }

  // Test connection
  testBtn.disabled = true;
  testBtn.textContent = 'Testing...';
  showBackendStatus('Testing connection...', '');

  try {
    const response = await fetch(`${url}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      showBackendStatus('✓ Connection successful!', 'success');
      
      // Save URL and continue
      setTimeout(() => {
        chrome.storage.sync.set({ backendUrl: url }, () => {
          nextStep();
        });
      }, 500);
    } else {
      showBackendStatus(
        `✗ Backend returned status ${response.status}. Make sure your backend server is running.`,
        'error'
      );
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      showBackendStatus('✗ Connection timeout. Check the URL and try again.', 'error');
    } else {
      showBackendStatus(
        '✗ Cannot reach the backend. Make sure it\'s running at the specified URL.',
        'error'
      );
    }
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = 'Test & Continue';
  }
}

/**
 * Show backend status message
 */
function showBackendStatus(message, type) {
  backendStatus.innerHTML = '';

  if (!type) {
    return;
  }

  const icon = type === 'success' ? '✓' : '✗';
  backendStatus.innerHTML = `
    <span class="status-icon">${icon}</span>
    <span>${message}</span>
  `;
  backendStatus.className = `status-message ${type}`;
}

/**
 * Complete setup
 */
function completeSetup() {
  // Mark setup as complete
  chrome.storage.sync.set({ setupCompleted: true }, () => {
    // Close this tab
    window.close();
  });
}

/**
 * Auto-detect backend URL
 */
async function autoDetectBackend() {
  const commonUrls = [
    'http://localhost:7860',
    'http://127.0.0.1:7860',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
  ];

  for (const url of commonUrls) {
    try {
      const response = await fetch(`${url}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000),
      });

      if (response.ok) {
        console.log(`[AI-NGFW] Auto-detected backend at ${url}`);
        backendUrlInput.value = url;
        return url;
      }
    } catch (error) {
      // Continue to next URL
    }
  }

  // No backend found
  return null;
}

/**
 * Handle Enter key on backend URL input
 */
backendUrlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    testBackendConnection();
  }
});

/**
 * Initialize setup wizard
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Check if setup already completed
  chrome.storage.sync.get('setupCompleted', (result) => {
    if (result.setupCompleted) {
      window.close();
    }
  });

  // Try to auto-detect backend
  const detectedUrl = await autoDetectBackend();
  if (detectedUrl) {
    backendUrlInput.value = detectedUrl;
  }

  // Show first step
  showStep(1);
});

console.log('[AI-NGFW] Setup wizard loaded');
