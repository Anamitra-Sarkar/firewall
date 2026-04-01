# AI-NGFW Quick Start Guide

Get up and running with the AI-NGFW in 5 minutes.

## Installation (Choose One)

### Option 1: Automated Setup Script

**macOS/Linux:**
```bash
chmod +x scripts/dev-setup.sh
bash scripts/dev-setup.sh
```

**Windows:**
```cmd
scripts/dev-setup.bat
```

### Option 2: Manual Setup

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install backend
pip install -e .

# 3. Install frontend
cd frontend
npm install
cd ..

# 4. Create .env file
cp .env .env
# Edit .env and add your Groq API key
```

## Running the Application

### Terminal 1: Start Backend
```bash
python -m backend.main
# Backend runs on http://localhost:7860
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### Access the App
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:7860/docs
- **Login**: Use any username/password (demo mode)

## Using Docker

```bash
# Build and run everything
docker-compose up --build

# Application: http://localhost:7860
```

## Environment Setup

Create `.env` file in project root:

```env
# Groq API (required for AI features)
GROQ_API_KEY=your_api_key_here

# Optional: Database (SQLite for dev, PostgreSQL for prod)
DATABASE_URL=sqlite:///./ai_ngfw.db

# Optional: Redis
REDIS_URL=redis://localhost:6379
```

**Get Groq API Key:**
1. Visit https://console.groq.com
2. Sign up/login
3. Create API key
4. Add to `.env`

## First Steps

1. **Login to Dashboard**
   - Any username/password works (demo mode)
   - Access at http://localhost:5173

2. **Explore Pages**
   - **Dashboard**: Real-time threat metrics and status
   - **Threats**: Browse detected threats
   - **Incidents**: Manage security incidents
   - **Analytics**: View security metrics
   - **Zero Trust**: Device trust management
   - **Rules**: Configure security rules

3. **Test API**
   - Visit http://localhost:7860/docs
   - Try "GET /api/threats" endpoint
   - Or use curl: `curl http://localhost:7860/health`

## Project Structure

```
ai-ngfw/
├── backend/          # Python FastAPI backend
│   ├── main.py      # Start here
│   ├── routers/     # API endpoints
│   └── services/    # AI/ML services
├── frontend/         # React frontend
│   ├── src/
│   │   ├── pages/   # Page components
│   │   └── components/ # UI components
│   └── package.json
├── Dockerfile        # Container image
├── docker-compose.yml # Service setup
└── README.md        # Full documentation
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `backend/main.py` | Start FastAPI server |
| `frontend/src/App.jsx` | React main component |
| `backend/routers/` | 10 API route modules |
| `frontend/src/pages/` | 6 page components |
| `.env` | Configuration variables |
| `Dockerfile` | Container image definition |
| `docker-compose.yml` | Docker Compose setup |

## Common Commands

### Backend
```bash
# Start development server
python -m backend.main

# Run with hot reload
python -m backend.main  # Already watches for changes

# View API documentation
# Visit http://localhost:7860/docs
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up volumes
docker-compose down -v
```

## API Quick Reference

### Get Threats
```bash
curl http://localhost:7860/api/threats?limit=10
```

### Create Incident
```bash
curl -X POST http://localhost:7860/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Critical Threat Detected",
    "description": "Malware detected on network",
    "severity": "critical"
  }'
```

### Get Dashboard Stats
```bash
curl http://localhost:7860/api/analytics/dashboard-stats?hours=24
```

### Check Health
```bash
curl http://localhost:7860/health
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 7860
lsof -i :7860  # macOS/Linux
netstat -ano | findstr :7860  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Database Issues
```bash
# Remove and recreate database
rm ai_ngfw.db
python -m backend.main  # Creates new database
```

### Frontend Not Loading
```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Missing Dependencies
```bash
# Reinstall all dependencies
pip install -e .
cd frontend && npm install
```

## Accessing Data

### View Threats in Database
```bash
# Connect to SQLite
sqlite3 ai_ngfw.db

# View threats
SELECT * FROM threats;

# Exit
.exit
```

### View API Response
```bash
# Pretty print JSON
curl -s http://localhost:7860/api/threats | jq .
```

## Next Steps

1. **Read Documentation**
   - Full guide: `README.md`
   - Deployment: `DEPLOYMENT.md`
   - Architecture: `ARCHITECTURE.md`

2. **Customize**
   - Add Groq API key for AI features
   - Modify dashboard colors in `frontend/tailwind.config.js`
   - Add custom API endpoints in `backend/routers/`

3. **Deploy**
   - Docker: `docker-compose up`
   - Production: See `DEPLOYMENT.md`

4. **Integrate**
   - Connect external threat feeds
   - Add SIEM integration
   - Configure monitoring

## Development Tips

### Hot Reloading
- Frontend: Automatically reloads on file changes
- Backend: Restart required for code changes

### Debugging
- Frontend: Open DevTools (F12) in browser
- Backend: Check console output and logs

### API Testing
- Swagger UI: http://localhost:7860/docs
- ReDoc: http://localhost:7860/redoc
- Postman: Import from `/docs`

## Performance Notes

- **Frontend Build**: ~5 seconds (Vite)
- **Backend Startup**: ~2 seconds
- **First Load**: ~3 seconds

## System Requirements

- **Python**: 3.11 or higher
- **Node.js**: 20 or higher
- **RAM**: 2GB minimum (4GB recommended)
- **Disk**: 500MB for dependencies and database
- **Network**: Internet for Groq API calls

## Getting Help

### Check Logs
```bash
# Backend logs
tail -f <stderr>

# Frontend console
Open browser DevTools (F12)

# Docker logs
docker-compose logs -f app
```

### Read Documentation
- README.md - Overview and features
- DEPLOYMENT.md - Setup and deployment
- ARCHITECTURE.md - Technical details
- API Docs - http://localhost:7860/docs

### Common Issues
See `DEPLOYMENT.md` Troubleshooting section

---

**Ready to go!** Your AI-NGFW is now running. Start by logging in and exploring the dashboard.

Need help? Check the full documentation in README.md or ARCHITECTURE.md.
