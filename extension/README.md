# AI-NGFW Chrome Extension

**Next-Generation AI-Powered Firewall for Your Browser**

A sophisticated Chrome extension that uses machine learning to detect and block advanced threats in real-time with sub-millisecond latency.

## Features

- **Real-Time Threat Detection**: AI-powered analysis of every network request
- **Intelligent Caching**: Cached decisions for instant protection on repeat requests
- **Zero Data Collection**: All analysis happens locally - your privacy is paramount
- **Lightweight**: <5MB memory footprint, no performance impact
- **Behavioral Analysis**: Detects suspicious page behavior and phishing attempts
- **Customizable Rules**: Create your own security policies
- **Live Threat Dashboard**: See blocked threats in real-time

## Installation

### Manual Installation (Development)

1. Clone the repository to your machine
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked" and select the `extension` folder
5. The extension will appear in your toolbar

### From Chrome Web Store (When Published)

Coming soon to the Chrome Web Store.

## Initial Setup

When you first install the extension:

1. The **Setup Wizard** will open automatically
2. Configure your backend server URL (defaults to `http://localhost:7860`)
3. Review the required permissions
4. Start protecting immediately

## Configuration

### Backend URL

The extension connects to an AI-NGFW backend server for threat analysis. By default, it looks for a local server on port 7860.

**To change the backend URL:**
1. Click the AI-NGFW icon in your toolbar
2. Click "Settings"
3. Enter your backend server URL
4. Click "Save Settings"

### Protection Settings

Open the extension options to customize:
- Enable/disable real-time threat detection
- Block phishing attempts
- Block malware downloads
- Show notifications when threats are detected
- Adjust threat threshold (0.0 - 1.0)

## How It Works

### Request Analysis Pipeline

```
Browser Request
    ↓
Content Script intercepts request
    ↓
Service Worker checks cache
    ↓
If not cached: Send to Backend API
    ↓
Backend analyzes for threats
    ↓
Return threat score to extension
    ↓
If score > threshold: BLOCK
    ↓
Cache decision for future requests
```

### Threat Analysis

The AI-NGFW backend analyzes requests for:

1. **Indicators of Compromise (IoCs)**
   - Known malicious domains and IPs
   - Suspicious URL patterns
   - Blacklist/whitelist checks

2. **Behavioral Signals**
   - Unusual request patterns
   - Redirect chains
   - Payment form detection
   - Script injection attempts

3. **Machine Learning Scoring**
   - Neural network-based classification
   - Ensemble threat models
   - Real-time pattern matching

## Architecture

```
extension/
├── manifest.json              # Chrome extension manifest
├── background.js              # Service worker - main logic
├── content.js                 # Content script - page behavior detection
├── popup.html/js             # Popup UI - threat display
├── options.html/js           # Settings page
├── setup.html/js             # Setup wizard
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   ├── icon-128.png
│   └── generate-icons.js     # Icon generator script
└── README.md
```

### Key Components

**Service Worker (background.js)**
- Monitors network requests in real-time
- Maintains threat cache for sub-millisecond decisions
- Communicates with backend API
- Updates popup badge with threat count

**Content Script (content.js)**
- Detects behavioral threats on pages
- Monitors page redirects
- Detects phishing attempts
- Gathers page analysis data

**Popup (popup.html)**
- Displays real-time threat statistics
- Shows recently blocked threats
- Block rate calculation
- Quick access to settings

**Options Page (options.html)**
- Configure backend URL
- Enable/disable protection features
- Adjust threat thresholds
- View protection statistics

## API Reference

### Backend Endpoints Used

The extension communicates with the following backend endpoints:

#### GET `/`
Check backend health
```
Response: { "message": "AI-NGFW API", ... }
```

#### POST `/api/v1/incidents/analyze`
Analyze a request for threats
```json
Request: {
  "url": "https://example.com/page",
  "domain": "example.com",
  "protocol": "https:",
  "method": "GET",
  "timestamp": "2024-01-01T00:00:00Z"
}

Response: {
  "threat_score": 0.85,
  "threat_type": "phishing",
  "is_threat": true,
  "reason": "Known phishing domain"
}
```

## Permissions

The extension requires these Chrome permissions:

- **webRequest**: Intercept and analyze network requests
- **tabs**: Access tab information
- **storage**: Store settings and cache locally
- **scripting**: Inject content scripts for behavioral detection
- **\<all_urls\>**: Monitor all web traffic

## Performance

- **Cache Hit Time**: <1ms
- **Request Analysis**: <50ms
- **Memory Usage**: <5MB
- **CPU Impact**: <1% at idle

## Troubleshooting

### Backend Connection Failed

**Problem**: Extension shows "Cannot reach backend"

**Solutions**:
1. Check backend server is running on the configured URL
2. Verify URL format: `http://localhost:7860`
3. Check firewall isn't blocking the connection
4. Ensure CORS is properly configured on backend

### No Threats Being Detected

**Problem**: All requests marked as safe

**Solutions**:
1. Check threat threshold setting (too high = fewer blocks)
2. Verify backend is returning threat scores
3. Check browser console for errors (Ctrl+Shift+J)
4. Reset stats and try again

### High Memory Usage

**Problem**: Extension using >10MB RAM

**Solutions**:
1. Click "Reset Stats" in popup to clear cache
2. Close and reopen the popup
3. Disable unnecessary background tabs
4. Restart the extension: Settings → Extensions → Reload

## Development

### Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Generate icons
node icons/generate-icons.js

# 3. Load in Chrome
# - Open chrome://extensions
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select this folder

# 4. Watch for changes
# - Edit files directly
# - Refresh extension in chrome://extensions
```

### Testing Backend Connection

Click "Test & Continue" in the setup wizard to verify backend connectivity.

### Debug Mode

Open the extension's service worker console:
1. Go to `chrome://extensions`
2. Find AI-NGFW and click "Details"
3. Scroll down and click "Background page"
4. Monitor console logs

## Security Considerations

### What the Extension Collects

- **Locally**: Request URLs, threat scores, cached decisions
- **Sent to Backend**: Only request URL, domain, protocol for analysis
- **NOT Collected**: Cookies, login credentials, form data, page content

### Data Privacy

- No data is stored on our servers
- No user tracking or analytics
- All analysis is stateless
- Cache is local-only
- Requests are analyzed and immediately forgotten

## Contributing

Contributions are welcome! Please:

1. Follow the code style conventions
2. Add tests for new features
3. Update documentation
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests:

- GitHub Issues: [Create an issue]
- Email: support@ai-ngfw.dev
- Documentation: https://docs.ai-ngfw.dev

## Changelog

### v1.0.0 (2024)
- Initial release
- Real-time threat detection
- Intelligent caching
- Behavioral analysis
- Setup wizard

---

**Built with ❤️ for a safer web**
