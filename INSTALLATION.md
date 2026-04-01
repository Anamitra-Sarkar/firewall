# AI-NGFW Installation & Setup Guide

Complete guide to install and configure the AI-NGFW system (backend + extension).

## System Architecture

```
┌─────────────────────┐
│   Browser (Chrome)  │
│  ┌───────────────┐  │
│  │  AI-NGFW Ext  │  │ ◄─── Analyzes requests
│  └────────┬────┘  │
│           │       │
│      HTTPS API Call│
│           │       │
└───────────┼───────┘
            │
            ▼
┌─────────────────────┐
│   Backend Server    │
│  (FastAPI + Python) │
│  ┌───────────────┐  │
│  │  AI Models    │  │
│  │  Threat Intel │  │
│  │  IoC Database │  │
│  └───────────────┘  │
└─────────────────────┘
```

## Prerequisites

### For Backend

- Python 3.10+
- pip or uv package manager
- SQLite (included) or PostgreSQL
- 256MB RAM minimum

### For Extension

- Chrome/Chromium 90+
- macOS, Windows, or Linux

## Backend Installation

### 1. Setup Python Environment

```bash
# Navigate to project root
cd /path/to/ai-ngfw

# Create virtual environment (using uv)
uv venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Or using pip
python -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
# Using uv (recommended)
uv pip install -r requirements.txt

# Or using pip
pip install -r requirements.txt
```

**Key dependencies:**
- `fastapi==0.104.1` - Web framework
- `sqlalchemy==2.0.23` - Database ORM
- `uvicorn==0.24.0` - ASGI server
- `pydantic==2.4.2` - Data validation

### 3. Configure Backend

Create `.env` file in project root:

```env
# Database
DATABASE_URL=sqlite:///./ai_ngfw.db
# Or PostgreSQL:
# DATABASE_URL=postgresql+asyncpg://user:password@localhost/ai_ngfw

# FastAPI
DEBUG=true
PORT=7860
API_TITLE=AI-NGFW API
API_VERSION=1.0.0

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=development

# Allowed Origins (for Chrome extension)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,chrome-extension://*

# Optional: Groq API for AI features
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=mixtral-8x7b-32768

# Optional: HuggingFace API
HUGGINGFACE_API_TOKEN=your-huggingface-token
```

### 4. Initialize Database

```bash
# Create database tables
python -m backend.main

# The database will be created automatically on startup
```

### 5. Start Backend Server

```bash
# Development mode
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 7860

# Production mode
python -m uvicorn backend.main:app --host 0.0.0.0 --port 7860 --workers 4
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:7860
INFO:     Application startup complete
```

### 6. Verify Backend

Test the API:

```bash
# Health check
curl http://localhost:7860

# Should return:
# {"message":"AI-NGFW API","version":"1.0.0","docs":"/docs"}

# View API documentation
# Open http://localhost:7860/docs in your browser
```

## Extension Installation

### 1. Generate Icons (Optional)

```bash
# Navigate to extension folder
cd extension/icons

# Install canvas (required for icon generation)
npm install canvas

# Generate icons in multiple sizes
node generate-icons.js

# Icons will be created:
# - icon-16.png (16x16)
# - icon-48.png (48x48)
# - icon-128.png (128x128)
```

### 2. Manual Installation in Chrome

```bash
# 1. Open Chrome Extensions page
# Open Chrome → Menu → More Tools → Extensions
# Or visit: chrome://extensions

# 2. Enable Developer Mode
# Toggle "Developer mode" in top-right corner

# 3. Load Extension
# Click "Load unpacked"
# Select the 'extension' folder in this project

# 4. Verify Installation
# You should see "AI-NGFW" in your extensions list with icon
```

### 3. Initial Setup Wizard

When you first load the extension:

1. **Setup Wizard Opens** automatically
2. **Step 1**: Review features and permissions
3. **Step 2**: Configure backend URL
   - Default: `http://localhost:7860`
   - Click "Test & Continue" to verify connection
4. **Step 3**: Review required permissions
5. **Step 4**: Completion - Extension is ready!

## Post-Installation Configuration

### Configure Extension Backend URL

If you skipped the setup wizard:

```bash
# 1. Click AI-NGFW icon in Chrome toolbar
# 2. Click "Settings" button
# 3. Enter backend URL (e.g., http://localhost:7860)
# 4. Click "Save Settings"
# 5. Test connection by clicking "Test Connection"
```

### Adjust Protection Settings

In **Settings** page, customize:

- **Real-Time Threat Detection**: ON/OFF
- **Block Phishing**: ON/OFF
- **Block Malware**: ON/OFF
- **Show Notifications**: ON/OFF
- **Threat Threshold**: 0.0 - 1.0 (higher = fewer blocks)

### Configure Backend (Advanced)

#### Change Database

```env
# SQLite (default)
DATABASE_URL=sqlite:///./ai_ngfw.db

# PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/ai_ngfw
```

#### Change Server Port

```env
PORT=8000  # Default is 7860
```

#### Enable HTTPS (Production)

```bash
# Generate SSL certificates
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# Start with SSL
python -m uvicorn backend.main:app \
  --ssl-keyfile=key.pem \
  --ssl-certfile=cert.pem \
  --host 0.0.0.0 \
  --port 7860
```

## Troubleshooting

### Backend Won't Start

**Error**: "Port 7860 already in use"
```bash
# Find process using port
lsof -i :7860  # macOS/Linux
netstat -ano | findstr :7860  # Windows

# Kill process or use different port
PORT=7861 python -m uvicorn backend.main:app --reload
```

**Error**: "ModuleNotFoundError"
```bash
# Ensure dependencies are installed
pip install -r requirements.txt

# Check Python version (3.10+ required)
python --version
```

### Extension Won't Connect to Backend

**Problem**: "Cannot reach backend" error

```bash
# 1. Verify backend is running
curl http://localhost:7860

# 2. Check firewall allows port 7860
# 3. Verify URL in extension settings matches backend

# 4. Check backend logs for CORS errors
# Should see: "CORS middleware enabled for origins..."

# 5. Restart extension
# chrome://extensions → Find AI-NGFW → Reload button
```

### High Memory Usage

**Problem**: Extension uses >10MB RAM

```bash
# 1. Clear extension cache
# Click extension icon → Settings → Clear Cache

# 2. Reset statistics
# Click extension icon → Reset Stats

# 3. Restart browser completely
```

### Database Errors

**Error**: "database is locked"
```bash
# Delete corrupted database and recreate
rm ai_ngfw.db

# Restart backend server
python -m uvicorn backend.main:app --reload
```

## Network Requirements

### Firewall/Proxy Configuration

**Backend Port**: 7860 (default)
**Required for**: Extension → Backend communication

Ensure your firewall allows:
- Outbound HTTPS on port 443
- Outbound HTTP on port 7860 (local development)
- CORS headers from `chrome-extension://*`

### For Remote Backend

If running backend on separate server:

```env
# In extension settings, use server IP
BACKEND_URL=http://192.168.1.100:7860
# Or with domain
BACKEND_URL=https://api.example.com
```

## Performance Tuning

### Backend Optimization

```env
# Increase workers for production
uvicorn backend.main:app --workers 4

# Enable response caching
CACHE_ENABLED=true
CACHE_TTL=3600

# Database connection pooling
DATABASE_POOL_SIZE=20
DATABASE_POOL_MAX_OVERFLOW=10
```

### Extension Optimization

- **Cache TTL**: 1 hour (configurable)
- **Request Timeout**: 5 seconds
- **Memory Limit**: 50MB cache
- **Threat Threshold**: 0.7 (default)

## Testing the Installation

### Test Backend API

```bash
# Test GET /
curl http://localhost:7860

# Test POST /api/incidents/analyze
curl -X POST http://localhost:7860/api/incidents/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "domain": "example.com",
    "protocol": "https:",
    "method": "GET",
    "timestamp": "2024-01-01T00:00:00Z"
  }'

# Should return:
# {"threat_score":0.0,"threat_type":null,"is_threat":false,"reason":"Request analyzed","cached":false}
```

### Test Extension

1. Open browser DevTools (F12)
2. Go to **Application** → **Chrome Extension Popup**
3. Verify popup loads without errors
4. Check **Console** tab for any [AI-NGFW] logs
5. Click extension icon and verify stats display

## Deployment

### Self-Hosted Production

```bash
# 1. Setup systemd service (Linux)
# Create /etc/systemd/system/ai-ngfw.service

[Unit]
Description=AI-NGFW Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/ai-ngfw
Environment="PATH=/opt/ai-ngfw/venv/bin"
ExecStart=/opt/ai-ngfw/venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port 7860
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# 2. Start service
sudo systemctl start ai-ngfw
sudo systemctl enable ai-ngfw
```

### Cloud Deployment

#### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

```bash
# Build and run
docker build -t ai-ngfw:latest .
docker run -p 7860:7860 -e DATABASE_URL=sqlite:///./ai_ngfw.db ai-ngfw:latest
```

#### Vercel (Frontend Hosting)

The landing page can be deployed to Vercel:

```bash
cd frontend
npm run deploy
```

## Next Steps

1. ✅ Backend running on `http://localhost:7860`
2. ✅ Extension installed in Chrome
3. ✅ Extension configured to connect to backend
4. ⏭️ Start browsing - protection is active!

## Support

- **Documentation**: https://docs.ai-ngfw.dev
- **GitHub Issues**: Create an issue for bugs
- **Email Support**: support@ai-ngfw.dev

## Environment Variables Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| DATABASE_URL | sqlite:///./ai_ngfw.db | Database connection |
| DEBUG | false | Enable debug logging |
| PORT | 7860 | Backend server port |
| ENVIRONMENT | development | deployment environment |
| SECRET_KEY | (required) | JWT secret key |
| ALGORITHM | HS256 | JWT algorithm |
| ALLOWED_ORIGINS | localhost | CORS allowed origins |

---

**Installation complete!** Your AI-NGFW system is now ready to protect your browsing. 🛡️
