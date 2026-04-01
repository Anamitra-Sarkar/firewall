# AI-NGFW Testing Guide

Comprehensive testing procedures for the AI-NGFW system.

## Pre-Launch Checklist

### Backend (FastAPI)

- [ ] Server starts without errors on `http://localhost:7860`
- [ ] Health check endpoint `/` returns proper response
- [ ] CORS headers allow `chrome-extension://*`
- [ ] Database initializes on startup
- [ ] All routers are properly registered
- [ ] API documentation accessible at `/docs`

**Test Commands:**

```bash
# Health check
curl http://localhost:7860

# Check CORS headers
curl -H "Origin: chrome-extension://test" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:7860/api/v1/incidents/analyze
```

### Extension Installation

- [ ] Extension loads without errors in Chrome
- [ ] Extension icon appears in toolbar
- [ ] Setup wizard launches on first install
- [ ] All UI pages load (popup, settings, setup)
- [ ] No console errors in DevTools

**Test Steps:**

1. Open `chrome://extensions`
2. Enable Developer mode
3. Load unpacked extension folder
4. Verify icon appears in toolbar
5. Click icon and verify popup loads
6. Right-click icon → Settings → Verify options page loads

### Landing Page

- [ ] Landing page loads without errors
- [ ] All sections are visible and responsive
- [ ] Links work correctly
- [ ] Mobile responsive (test on 375px width)
- [ ] No console errors
- [ ] Images and icons display correctly

**Test URL:** `http://localhost:7860/landing`

## Functional Testing

### Extension Setup Wizard

**Test 1: Auto-detect Backend**

1. Install extension
2. Setup wizard opens
3. Backend URL auto-fills to `http://localhost:7860`
4. Click "Test & Continue"
5. Connection succeeds
6. **Expected**: Advance to step 3

**Test 2: Manual Backend URL**

1. Change URL to invalid: `http://invalid.local:7860`
2. Click "Test & Continue"
3. Error message appears
4. **Expected**: Stay on step 2 with error

**Test 3: Complete Setup**

1. Configure backend successfully
2. Review permissions (step 3)
3. Click "Continue"
4. Setup complete (step 4)
5. Click "Close Setup"
6. **Expected**: Setup page closes, extension ready

### Request Analysis

**Test 1: Safe Request**

1. In popup, monitor requests
2. Visit `https://google.com`
3. Check popup for new requests
4. **Expected**: Request shows in popup with green status

**Test 2: Suspicious Request**

1. Configure backend to return high threat score
2. Make request to test domain
3. **Expected**: Request appears blocked in popup

**Test 3: Cache Hit**

1. Visit same domain twice quickly
2. Check second request is faster (cache hit)
3. **Expected**: <5ms response time on cache hit

### Popup UI

**Test 1: Real-time Updates**

1. Open popup
2. Make requests in browser
3. Check popup updates without refresh
4. **Expected**: New threats appear within 2 seconds

**Test 2: Stats Calculation**

1. Block 5 requests
2. Check popup shows:
   - Threat count: 5
   - Block rate: calculated correctly
3. **Expected**: Stats accurate

**Test 3: Reset Stats**

1. Have some blocked threats
2. Click "Reset Stats"
3. Confirm dialog
4. **Expected**: Stats reset to 0

### Settings Page

**Test 1: Save Settings**

1. Change backend URL
2. Adjust threat threshold
3. Toggle settings on/off
4. Click "Save Settings"
5. **Expected**: "Settings saved" message appears

**Test 2: Backend Connection Test**

1. Enter valid backend URL
2. Click "Test Connection"
3. **Expected**: Success message appears

**Test 3: Reset to Defaults**

1. Change all settings
2. Click "Reset to Defaults"
3. Confirm dialog
4. **Expected**: All settings reset to defaults

## Performance Testing

### Request Analysis Speed

**Test 1: Cache Hit Performance**

```javascript
// In console on any website
const start = performance.now();
chrome.runtime.sendMessage({ action: 'analyzeRequest' }, () => {
  const end = performance.now();
  console.log(`Analysis took ${end - start}ms`);
});
```

**Expected:** <1ms for cached requests

**Test 2: Cache Miss Performance**

```javascript
// Clear cache first, then test new URL
const start = performance.now();
chrome.runtime.sendMessage({ action: 'analyzeRequest', url: 'new-url' }, () => {
  const end = performance.now();
  console.log(`Analysis took ${end - start}ms`);
});
```

**Expected:** <50ms for cache miss

### Memory Usage

**Test 1: Memory Leak Check**

1. Open popup
2. Monitor memory in DevTools
3. Leave open for 5 minutes
4. Make 100+ requests
5. Check memory growth

**Expected:** Memory increase <10MB over 5 minutes

**Test 2: Large Cache**

1. Visit 1000+ different domains
2. Check memory usage
3. Reset stats to clear cache
4. **Expected:** Memory drops back to baseline

### Browser Performance

**Test 1: Page Load Speed**

1. Disable extension
2. Test page load time
3. Enable extension
4. Test page load time again
5. **Expected:** <5% difference in load time

**Test 2: CPU Usage**

1. Monitor CPU in Task Manager
2. At idle, check CPU usage
3. Start browsing with requests
4. **Expected:** CPU usage <1% at idle

## API Testing

### /api/v1/incidents/analyze

**Test 1: Valid Request**

```bash
curl -X POST http://localhost:7860/api/v1/incidents/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "domain": "example.com",
    "protocol": "https:",
    "method": "GET"
  }'
```

**Expected Response:**
```json
{
  "threat_score": 0.0,
  "threat_type": null,
  "is_threat": false,
  "reason": "Request analyzed",
  "cached": false
}
```

**Test 2: Suspicious Request**

```bash
curl -X POST http://localhost:7860/api/v1/incidents/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://login-verify-account.com/confirm",
    "domain": "login-verify-account.com",
    "protocol": "http:",
    "method": "POST"
  }'
```

**Expected:** threat_score > 0.7

**Test 3: Invalid Request**

```bash
curl -X POST http://localhost:7860/api/v1/incidents/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "not-a-url"
  }'
```

**Expected:** 400 Bad Request error

### /api/incidents

**Test 1: Get Incidents**

```bash
curl http://localhost:7860/api/incidents?limit=10
```

**Expected:** List of incidents

**Test 2: Create Incident**

```bash
curl -X POST http://localhost:7860/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Incident",
    "description": "Test",
    "severity": "high"
  }'
```

**Expected:** New incident with ID

## Cross-Browser Testing

### Chrome

- [ ] Extension loads
- [ ] All features work
- [ ] UI renders correctly

### Edge (Chromium)

- [ ] Extension loads
- [ ] Same features as Chrome
- [ ] UI works properly

### Firefox (Future)

- [ ] Adapt manifest.json for WebExtensions
- [ ] Test functionality
- [ ] Verify UI rendering

## Compatibility Testing

### Operating Systems

**Windows 10/11**

- [ ] Backend runs without errors
- [ ] Extension loads and works
- [ ] Paths work correctly (backslashes)

**macOS**

- [ ] Backend runs without errors
- [ ] Extension loads and works
- [ ] File permissions correct

**Linux (Ubuntu)**

- [ ] Backend runs without errors
- [ ] Extension loads and works
- [ ] Port 7860 accessible

### Python Versions

**Test 3.10:**
```bash
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload
```

**Test 3.11:**
```bash
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload
```

**Test 3.12:**
```bash
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload
```

**Expected:** Works on all versions

## Security Testing

### CORS Configuration

**Test 1: Chrome Extension Origin**

```bash
curl -H "Origin: chrome-extension://test123" \
  http://localhost:7860/api/v1/incidents/analyze
```

**Expected:** CORS headers allow origin

**Test 2: Browser Origin (Should Fail)**

```bash
curl -H "Origin: http://localhost:3000" \
  http://localhost:7860/api/v1/incidents/analyze
```

**Expected:** CORS headers reject origin (unless whitelisted)

### Input Validation

**Test 1: SQL Injection Attempt**

```bash
curl -X POST http://localhost:7860/api/v1/incidents/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com\" OR \"1\"=\"1",
    "domain": "example.com",
    "protocol": "https:"
  }'
```

**Expected:** Request validated and sanitized

**Test 2: XSS Attempt in Popup**

```javascript
// In console of popup
const maliciousData = {
  domain: "<script>alert('XSS')</script>",
  reason: "<img src=x onerror=alert('XSS')>"
};
// Should be escaped
```

**Expected:** HTML entities escaped, no script execution

## Regression Testing

### After Updates

Create test script to verify:

```bash
#!/bin/bash

echo "Testing AI-NGFW Regression..."

# Test 1: Backend health
curl -f http://localhost:7860 || exit 1
echo "✓ Backend health check"

# Test 2: API endpoint
curl -f -X POST http://localhost:7860/api/v1/incidents/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "domain": "example.com",
    "protocol": "https:"
  }' || exit 1
echo "✓ API endpoint working"

# Test 3: Extension loads
# Manual check: chrome://extensions should show extension

echo "✓ All regression tests passed!"
```

## User Acceptance Testing

### Scenario 1: New User Setup

1. User installs extension
2. Setup wizard guides through configuration
3. Backend URL auto-detected
4. Settings saved successfully
5. Extension ready to use

**Expected:** User can protect browsing within 2 minutes

### Scenario 2: Daily Usage

1. User browses normally
2. Extension monitors traffic silently
3. If threat detected, request blocked
4. Threat appears in popup
5. User can view settings anytime

**Expected:** No interruption to browsing, transparent protection

### Scenario 3: Configuration Change

1. User opens settings
2. Adjusts threat threshold
3. Changes backend URL
4. Saves settings
5. Changes take effect immediately

**Expected:** Settings apply without extension restart

## Test Report Template

```markdown
# Test Report - [Date]

## Summary
- Tests Passed: X/Y
- Tests Failed: 0
- Tests Skipped: 0
- Pass Rate: X%

## Environment
- OS: [Windows/macOS/Linux]
- Python Version: [3.10/3.11/3.12]
- Chrome Version: [XX]
- Backend Running: Yes/No
- Extension Loaded: Yes/No

## Test Results

### Backend
- [ ] Server starts successfully
- [ ] Health check passes
- [ ] API endpoints respond
- [ ] CORS configured correctly

### Extension
- [ ] Loads without errors
- [ ] Setup wizard completes
- [ ] Threat analysis works
- [ ] Popup displays correctly
- [ ] Settings page functional

### Integration
- [ ] Extension connects to backend
- [ ] Requests are analyzed
- [ ] Threats are detected
- [ ] Cache is working

## Issues Found
1. [Issue #1]
2. [Issue #2]

## Notes
- All tests passed without critical issues
- Ready for production deployment

---
Tested by: [Your Name]
Date: [YYYY-MM-DD]
```

## Continuous Testing

### Pre-Commit Tests

```bash
# Run before committing code
pytest backend/tests/
flake8 backend/
black --check backend/

# Check extension syntax
jshint extension/*.js
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pytest backend/tests/
      - run: flake8 backend/
```

## Known Issues & Workarounds

### Issue 1: Backend Connection Failed

**Symptoms:** "Cannot reach backend" error

**Workaround:**
```bash
# Restart backend
python -m uvicorn backend.main:app --reload

# Clear extension cache
# Settings → Clear Cache
```

### Issue 2: High Memory Usage

**Symptoms:** Extension uses >20MB RAM

**Workaround:**
```bash
# Reset extension data
# Click extension → Reset Stats

# Reload extension
# chrome://extensions → Reload
```

---

## Success Criteria

✅ **All tests pass with:**
- 100% of backend endpoints working
- 0 security vulnerabilities
- <50ms request analysis time
- <5MB memory footprint
- 99% uptime
- Seamless user experience

