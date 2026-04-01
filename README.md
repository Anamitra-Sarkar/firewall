# AI-NGFW (AI-Driven Next-Generation Firewall)

A production-ready, AI-powered Next-Generation Firewall with real-time threat detection, zero-trust implementation, and federated learning capabilities.

## 🎯 Project Status

**✅ Production Ready** - All core features implemented and tested.

## 📋 Architecture

```
ai-ngfw/
├── frontend/                 # React + Vite (Vercel)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API integration (Axios)
│   │   ├── hooks/           # Custom React hooks
│   │   └── store/           # State management (Zustand)
│   ├── package.json
│   ├── vite.config.js
│   └── .env
├── backend/                  # Python FastAPI (HuggingFace Spaces)
│   ├── routers/             # API endpoints
│   │   ├── auth.py          # Authentication
│   │   ├── traffic.py       # Traffic analysis
│   │   ├── threats.py       # Threat intelligence
│   │   ├── incidents.py     # Incident response (SOAR)
│   │   ├── ztna.py          # Zero Trust
│   │   ├── analytics.py     # Dashboards
│   │   ├── rules.py         # Policy rules
│   │   ├── federated_learning.py  # Federated learning
│   │   └── ai_chat.py       # AI-powered insights
│   ├── services/            # ML/AI services
│   │   ├── threat_analyzer.py       # Threat detection
│   │   ├── anomaly_detector.py      # Anomaly detection
│   │   ├── behavioral_analyzer.py   # Behavioral analysis
│   │   └── ai_service.py            # AI service
│   ├── models.py            # Database models
│   ├── database.py          # Database setup
│   ├── config.py            # Configuration
│   └── main.py              # FastAPI app
├── .github/workflows/       # CI/CD workflows
│   ├── deploy-hf.yml        # Deploy to HuggingFace Spaces
│   └── deploy-vercel.yml    # Deploy to Vercel
├── .env                     # Environment variables
├── Dockerfile               # Multi-stage build (all-in-one)
├── Dockerfile.hf            # Backend only (HuggingFace Spaces)
└── vercel.json              # Vercel configuration
```

## 🚀 Deployment Guide

### Frontend Deployment (Vercel)

The frontend is automatically deployed to Vercel on every push to `main` or `develop` branches via GitHub Actions.

**Manual Deployment:**
```bash
cd frontend
npm run build
vercel deploy --prod
```

**Environment Variables (Vercel):**
- `VITE_API_URL`: Backend API URL (https://ai-ngfw-backend.hf.space)

### Backend Deployment (HuggingFace Spaces)

The backend is automatically synced to HuggingFace Spaces on every push via GitHub Actions.

**Manual Setup:**
1. Create a HuggingFace Space: https://huggingface.co/new-space
2. Select Docker as the space type
3. Connect your GitHub repository
4. Use `Dockerfile.hf` as the Dockerfile

**Required GitHub Secrets:**
- `HF_TOKEN`: HuggingFace API token
- `HF_SPACE_REPO`: HuggingFace Space repository (format: `username/space-name`)
- `VERCEL_TOKEN`: Vercel API token
- `VERCEL_PROJECT_ID`: Vercel project ID
- `VERCEL_ORG_ID`: Vercel organization ID

## 🔧 Development Setup

### Prerequisites
- Node.js 20+
- Python 3.11+
- Git

### Local Development

1. **Clone and setup:**
```bash
git clone <your-repo>
cd ai-ngfw

# Install backend dependencies
pip install -e .

# Install frontend dependencies
cd frontend
npm install
cd ..
```

2. **Configure environment:**
```bash
# Backend (.env)
cp .env.example .env

# Frontend
cd frontend
cp .env.example .env
cd ..
```

3. **Start development servers:**
```bash
# Terminal 1: Backend
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 7860

# Terminal 2: Frontend
cd frontend && npm run dev
```

Visit:
- Frontend: http://localhost:5173
- Backend: http://localhost:7860
- API Docs: http://localhost:7860/docs

## 🔑 API Key Setup

Add the following to your `.env` file:

```env
# Groq API (for AI-powered analysis)
GROQ_API_KEY=your_groq_api_key

# HuggingFace (for model integration)
HUGGINGFACE_API_TOKEN=your_hf_token
```

Get API keys:
- **Groq**: https://console.groq.com
- **HuggingFace**: https://huggingface.co/settings/tokens

## 📦 Build and Test

### Frontend Build
```bash
cd frontend
npm run build
npm run preview  # Test production build locally
```

### Backend Testing
```bash
pytest backend/
```

### Docker Build
```bash
# Full stack (includes frontend)
docker build -t ai-ngfw:latest .

# Backend only (HuggingFace Spaces)
docker build -f Dockerfile.hf -t ai-ngfw-backend:latest .

# Run locally
docker run -p 7860:7860 ai-ngfw-backend:latest
```

## 🎯 Features Implemented

### ✅ Core Threat Detection
- **Deep Packet Inspection (DPI)**: Real-time traffic analysis
- **Anomaly Detection**: Statistical & ML-based outlier detection
- **Threat Intelligence**: Threat scoring and classification
- **C2 Detection**: Command & Control communication detection

### ✅ Zero Trust Architecture
- **Risk-Based Authentication**: Adaptive access control
- **Behavioral Analysis**: User and device fingerprinting
- **Micro-Segmentation**: Policy-based network isolation
- **Continuous Verification**: Real-time trust scoring

### ✅ AI/ML Integration
- **Federated Learning**: Distributed model training
- **AI Chat**: Groq-powered security insights
- **Predictive Analytics**: Threat forecasting
- **Behavioral Biometrics**: User behavior modeling

### ✅ Incident Response
- **SOAR Integration**: Automated remediation workflows
- **Alert Management**: Real-time threat notifications
- **Policy Rules**: Dynamic rule engine
- **Incident Correlation**: Threat pattern detection

### ✅ Analytics & Visualization
- **Real-time Dashboard**: Live threat monitoring
- **Attack Timeline**: Historical analysis
- **Threat Heatmaps**: Geographic threat visualization
- **Performance Metrics**: System health monitoring

## 🔄 CI/CD Workflows

Two automated deployment workflows are configured:

### 1. HuggingFace Spaces Deployment (`deploy-hf.yml`)
Triggers on push to `main` or `develop`:
- Syncs backend code to HuggingFace Space
- Builds Docker container
- Auto-deploys on updates

### 2. Vercel Deployment (`deploy-vercel.yml`)
Triggers on push to `main` or `develop`:
- Builds React frontend
- Deploys to Vercel
- Sets `VITE_API_URL` environment variable

### Setup Workflows

Add the following GitHub Secrets:

```
HF_TOKEN              # HuggingFace API token
HF_SPACE_REPO         # username/space-name
VERCEL_TOKEN          # Vercel API token
VERCEL_PROJECT_ID     # Your Vercel project ID
VERCEL_ORG_ID         # Your Vercel org ID
```

## 📊 Database

- **Default**: SQLite (`ai_ngfw.db`) - for development
- **Production**: Configure `DATABASE_URL` in `.env`
  - PostgreSQL: `postgresql://user:pass@localhost/ai_ngfw`
  - MySQL: `mysql://user:pass@localhost/ai_ngfw`

## 🛡️ Security Checklist

- [ ] Change `SECRET_KEY` in production
- [ ] Use HTTPS in production
- [ ] Set strong `ALLOWED_ORIGINS` for CORS
- [ ] Configure proper authentication tokens
- [ ] Enable database encryption
- [ ] Set up rate limiting
- [ ] Configure WAF rules
- [ ] Enable audit logging

## 📄 Configuration Reference

### Backend (.env)
```env
# Server
ENVIRONMENT=production
DEBUG=false
PORT=7860
SECRET_KEY=your-secret-key

# Database
DATABASE_URL=sqlite:///./ai_ngfw.db

# APIs
GROQ_API_KEY=
HUGGINGFACE_API_TOKEN=

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.vercel.app

# Frontend
FRONTEND_URL=https://your-domain.vercel.app
```

### Frontend (.env)
```env
VITE_API_URL=https://ai-ngfw-backend.hf.space/api
VITE_APP_NAME=AI-NGFW
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/name`
4. Open a Pull Request

## 📝 License

Copyright © 2024. All rights reserved.

## 🆘 Support

For issues and questions:
- Check existing GitHub issues
- Review API documentation at `/docs`
- Check logs: `docker logs <container-id>`

## 🎉 Getting Started Checklist

- [ ] Clone repository
- [ ] Install dependencies
- [ ] Configure `.env` files
- [ ] Set up GitHub Secrets for CI/CD
- [ ] Start development servers
- [ ] Access frontend at http://localhost:5173
- [ ] Test API at http://localhost:7860/docs
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to HuggingFace Spaces
