# AI-NGFW Development Guide

Complete guide for developers working on AI-NGFW.

## Project Structure

```
ai-ngfw/
├── backend/                    # FastAPI backend
│   ├── main.py                # Main app entry point
│   ├── config.py              # Configuration management
│   ├── database.py            # Database setup
│   ├── models.py              # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   ├── routers/               # API route handlers
│   │   ├── auth.py
│   │   ├── incidents.py       # Threat analysis endpoint
│   │   ├── threats.py
│   │   ├── traffic.py
│   │   ├── analytics.py
│   │   └── ...
│   ├── services/              # Business logic
│   ├── models.py              # Database models
│   └── utils/                 # Utilities
├── extension/                 # Chrome extension
│   ├── manifest.json          # Extension manifest
│   ├── background.js          # Service worker
│   ├── content.js             # Content script
│   ├── popup.html/js          # Popup UI
│   ├── options.html/js        # Settings page
│   ├── setup.html/js          # Setup wizard
│   └── icons/                 # Extension icons
├── frontend/                  # React frontend (dashboard)
│   ├── src/
│   ├── public/
│   │   └── landing.html       # Landing page
│   └── package.json
├── scripts/                   # Utility scripts
├── docs/                      # Documentation
├── .env.example               # Example env file
├── requirements.txt           # Python dependencies
├── INSTALLATION.md            # Installation guide
├── API_REFERENCE.md           # API documentation
├── DEVELOPMENT.md             # This file
└── README.md                  # Project overview
```

## Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/anamitra-sarkar/firewall.git
cd firewall
```

### 2. Setup Backend

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 3. Setup Extension

```bash
# Navigate to extension folder
cd extension

# Generate icons (optional)
npm install canvas
node icons/generate-icons.js

# Load in Chrome
# chrome://extensions → Load unpacked → select extension folder
```

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Running the Application

### Terminal 1: Backend Server

```bash
# From project root
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 7860
```

### Terminal 2: Frontend (Optional)

```bash
cd frontend
npm run dev
```

### Browser: Load Extension

1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder

## Key Components

### Backend Service Worker

**File**: `backend/routers/incidents.py`

Handles threat analysis requests from the extension:

```python
@router.post("/analyze", response_model=RequestAnalysisResponse)
async def analyze_request(request: RequestAnalysisRequest):
    """Analyze request for threats"""
    # Extract domain and analyze
    threat_score = ml_model.predict(request)
    return RequestAnalysisResponse(
        threat_score=threat_score,
        threat_type=classify_threat(threat_score),
        is_threat=threat_score > 0.7
    )
```

### Extension Service Worker

**File**: `extension/background.js`

Monitors network requests and calls backend:

```javascript
chrome.webRequest.onBeforeSendHeaders.addListener(
  async (details) => {
    const analysis = await analyzeRequest(details.url);
    if (analysis.isBlocked) {
      return { cancel: true };
    }
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);
```

### Content Script

**File**: `extension/content.js`

Detects behavioral threats on pages:

```javascript
// Monitor for suspicious eval()
window.eval = function(...args) {
  sendBehavioralSignal('eval_detected');
  return originalEval.apply(this, args);
};
```

## Database Schema

### Incident Model

```python
class Incident(Base):
    __tablename__ = "incidents"
    
    id: int
    title: str
    description: str
    status: IncidentStatus  # open, resolved, closed
    severity: str           # low, medium, high, critical
    threat_ids: List[int]
    remediation_steps: List[str]
    created_at: datetime
    updated_at: datetime
```

### Threat Model

```python
class Threat(Base):
    __tablename__ = "threats"
    
    id: int
    threat_type: str        # phishing, malware, suspicious
    domain: str
    ip_address: str
    threat_score: float     # 0.0 - 1.0
    ioc_type: str          # domain, ip, url, hash
    source: str            # database, ml_model, user_report
    created_at: datetime
```

## API Development

### Adding New Endpoints

1. Create route handler in appropriate router:

```python
# backend/routers/new_feature.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/data")
async def get_data():
    """Get data"""
    return {"data": []}
```

2. Register router in main.py:

```python
from .routers import new_feature

app.include_router(new_feature.router, prefix="/api/new", tags=["New Feature"])
```

3. Add schema validation:

```python
from pydantic import BaseModel

class DataResponse(BaseModel):
    id: int
    name: str
    value: float
```

### Testing Endpoints

```bash
# Test GET request
curl http://localhost:7860/api/data

# Test POST request
curl -X POST http://localhost:7860/api/data \
  -H "Content-Type: application/json" \
  -d '{"name": "test", "value": 42}'

# View API docs
# Open http://localhost:7860/docs
```

## Extension Development

### Debugging the Service Worker

```javascript
// In background.js
console.log('[AI-NGFW] Debug message:', variable);

// View logs:
// chrome://extensions → AI-NGFW Details → Background Page
```

### Debugging Content Script

```javascript
// In content.js
console.log('[AI-NGFW] Content script message');

// View in page console (F12)
```

### Testing Cache

```javascript
// In background.js service worker
console.log('[AI-NGFW] Cache size:', threatCache.size);
console.log('[AI-NGFW] Cache entries:', Array.from(threatCache.keys()));
```

## Threat Analysis Improvements

### Current Implementation

The `/api/incidents/analyze` endpoint currently uses simple heuristics:

```python
# Check for phishing patterns
if 'login' in domain or 'verify' in domain:
    threat_score += 0.2

# Check protocol
if protocol != 'https:':
    threat_score += 0.15
```

### Enhancement Ideas

1. **ML Model Integration**
   - Train classifier on known malicious domains
   - Use URL features (length, special chars, entropy)
   - Integrate with TensorFlow/PyTorch

2. **IoC Database**
   - Integrate with AlienVault OTX
   - Use Shodan API for IP reputation
   - Check against URLhaus

3. **Behavioral Analysis**
   - Track redirect chains
   - Detect form grabbing
   - Monitor API calls

### Implementation Example

```python
import asyncio
from sklearn.ensemble import RandomForestClassifier

class ThreatAnalyzer:
    def __init__(self):
        self.model = RandomForestClassifier()
    
    def extract_features(self, url, domain, protocol):
        """Extract features for ML model"""
        return [
            len(domain),
            domain.count('-'),
            domain.count('.'),
            len(url),
            1 if protocol == 'https:' else 0,
            # ... more features
        ]
    
    def predict_threat(self, url, domain, protocol):
        """Predict threat probability"""
        features = self.extract_features(url, domain, protocol)
        return self.model.predict_proba([features])[0][1]

# Usage in endpoint
analyzer = ThreatAnalyzer()
threat_score = analyzer.predict_threat(url, domain, protocol)
```

## Performance Optimization

### Caching Strategy

1. **Request Cache** (1 hour TTL)
   - Cache threat analysis results by URL
   - Avoid analyzing same URL twice

2. **Domain Cache** (6 hours TTL)
   - Cache threat status by domain
   - Reduce full URL analysis

3. **Model Cache** (Memory)
   - Keep ML model in memory
   - Avoid reloading for each request

### Database Optimization

```python
# Add database indexes for common queries
class Incident(Base):
    __table_args__ = (
        Index('idx_status_created', 'status', 'created_at'),
        Index('idx_severity', 'severity'),
    )
```

## Testing

### Unit Tests

```python
# tests/test_incidents.py
import pytest
from backend.routers import incidents

@pytest.mark.asyncio
async def test_analyze_request():
    request = RequestAnalysisRequest(
        url="https://example.com",
        domain="example.com",
        protocol="https:",
        method="GET"
    )
    response = await incidents.analyze_request(request)
    assert response.threat_score >= 0.0
    assert response.threat_score <= 1.0
```

### Integration Tests

```bash
# Start backend
python -m uvicorn backend.main:app --reload

# Run tests
pytest tests/

# Test with coverage
pytest --cov=backend tests/
```

### Extension Testing

```javascript
// tests/background.test.js
describe('Background Service Worker', () => {
  test('analyzeRequest returns threat score', async () => {
    const result = await analyzeRequest({
      url: 'https://example.com',
      tabId: 1,
      method: 'GET'
    });
    expect(result.isBlocked).toBeDefined();
    expect(result.threatScore).toBeGreaterThanOrEqual(0);
  });
});
```

## Monitoring & Logging

### Backend Logging

```python
import logging

logger = logging.getLogger(__name__)

logger.info("Request analyzed")
logger.warning("Threat detected")
logger.error("Analysis failed", exc_info=True)
```

### Extension Logging

```javascript
// Use standardized format
console.log('[AI-NGFW] Message');

// Color coding in devtools
console.log('%c[AI-NGFW]%c Info message', 'color: blue', 'color: inherit');
console.error('%c[AI-NGFW]%c Error message', 'color: red', 'color: inherit');
```

## Building for Production

### Backend

```bash
# Build Docker image
docker build -t ai-ngfw:latest .

# Run container
docker run -p 7860:7860 -e DATABASE_URL=... ai-ngfw:latest

# Or use systemd
sudo systemctl start ai-ngfw
```

### Extension

```bash
# Prepare for Chrome Web Store
# 1. Remove developer mode code
# 2. Minify JavaScript
# 3. Update manifest version
# 4. Create production build

zip -r ai-ngfw-v1.0.0.zip extension/
# Upload to Chrome Web Store Developer Dashboard
```

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/name`
4. Open Pull Request

### Code Style

- **Python**: PEP 8 (use `black` formatter)
- **JavaScript**: ES6+ (use `prettier`)
- **HTML/CSS**: Standard conventions

```bash
# Format code
black backend/
npx prettier --write extension/
```

## Security Considerations

### CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://*"],  # Only extension
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Input Validation

```python
# Use Pydantic for validation
class RequestAnalysisRequest(BaseModel):
    url: str = Field(..., max_length=2048)
    domain: str = Field(..., max_length=255)
    protocol: str = Field(..., regex=r'^https?:$')
```

### Rate Limiting

```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/incidents")
@limiter.limit("100/minute")
async def get_incidents(request: Request):
    pass
```

## Troubleshooting Development

### Backend Won't Start

```bash
# Check Python version
python --version  # Should be 3.10+

# Check dependencies
pip list

# Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name '*.pyc' -delete
```

### Extension Not Working

```bash
# Check manifest.json is valid
# Open Chrome DevTools → console
# Check for errors

# Reload extension
# chrome://extensions → Find extension → Reload

# Check background script logs
# chrome://extensions → Details → Background page
```

### Database Errors

```bash
# Reset SQLite database
rm ai_ngfw.db

# Restart backend
python -m uvicorn backend.main:app --reload
```

## Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org
- **Chrome Extension Docs**: https://developer.chrome.com/docs/extensions/
- **Python Best Practices**: https://pep8.org/

## Support

For development questions:
- Open GitHub issues
- Submit pull requests
- Join discussion forum

---

**Happy developing!**
