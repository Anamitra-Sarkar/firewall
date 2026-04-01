# Deployment Setup Instructions

## Quick Start: 5 Steps to Production

### Step 1: Prepare GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: AI-NGFW production ready"
git remote add origin <your-github-repo>
git push -u origin main
```

### Step 2: Create GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

```
HF_TOKEN              → Get from https://huggingface.co/settings/tokens
HF_SPACE_REPO         → Format: username/space-name (create space first)
VERCEL_TOKEN          → Get from https://vercel.com/account/tokens
VERCEL_PROJECT_ID     → Get from Vercel dashboard
VERCEL_ORG_ID         → Get from Vercel dashboard
```

### Step 3: Create HuggingFace Space

1. Visit https://huggingface.co/new-space
2. Select:
   - Space name: `ai-ngfw-backend`
   - License: Space license (your choice)
   - Private: No (unless required)
   - Space SDK: **Docker**
3. Click "Create Space"
4. Note the repo URL: `https://huggingface.co/spaces/username/ai-ngfw-backend`

### Step 4: Create Vercel Project

Option A: Connect GitHub (Recommended)
1. Visit https://vercel.com/new
2. Import your GitHub repository
3. Set Project name: `ai-ngfw-frontend`
4. Build Command: `cd frontend && npm run build`
5. Output Directory: `frontend/dist`
6. Root Directory: `.`
7. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://huggingface.co/spaces/username/ai-ngfw-backend` (will be updated after backend deployment)
8. Click Deploy

Option B: Manual Upload
```bash
npm install -g vercel
cd frontend
vercel deploy --prod
```

### Step 5: Configure Environment Variables

**Backend Production (.env in HuggingFace Space):**
```env
ENVIRONMENT=production
DEBUG=false
PORT=7860
SECRET_KEY=<generate-strong-key>
DATABASE_URL=sqlite:///./ai_ngfw.db
ALLOWED_ORIGINS=https://your-domain.vercel.app,https://ai-ngfw-backend.hf.space
FRONTEND_URL=https://your-domain.vercel.app
GROQ_API_KEY=<optional>
HUGGINGFACE_API_TOKEN=<optional>
```

**Frontend Production (Vercel Dashboard):**
```
VITE_API_URL=https://huggingface.co/spaces/username/ai-ngfw-backend
```

## Deployment Flow

### On Code Push to `main`:

```
Git Push (main branch)
    ↓
GitHub Actions Triggered
    ├── Deploy Backend
    │   └── HuggingFace Spaces
    │       ├── Pull latest code
    │       ├── Build Docker image
    │       └── Deploy automatically
    │
    └── Deploy Frontend
        └── Vercel
            ├── Build React app
            ├── Optimize assets
            └── Deploy to CDN
```

## Verify Deployment

### 1. Check Backend

Visit: `https://huggingface.co/spaces/username/ai-ngfw-backend`

Check endpoint: `https://ai-ngfw-backend.hf.space/`

```bash
curl https://ai-ngfw-backend.hf.space/
```

Expected response:
```json
{
  "message": "AI-NGFW API",
  "version": "0.1.0",
  "docs": "/docs"
}
```

### 2. Check Frontend

Visit: `https://your-domain.vercel.app`

Should load the AI-NGFW dashboard.

### 3. Test API Connection

Open browser console and check:
- Network tab should show API requests to HuggingFace backend
- No CORS errors
- Auth endpoints should be accessible

## Troubleshooting

### Backend not starting

1. Check HuggingFace Space logs
2. Verify `Dockerfile.hf` is correct
3. Check environment variables are set
4. Ensure port 7860 is correct

### Frontend API connection fails

1. Verify `VITE_API_URL` environment variable
2. Check CORS settings on backend
3. Verify `ALLOWED_ORIGINS` includes Vercel domain
4. Check browser console for specific errors

### GitHub Actions failing

1. Verify GitHub Secrets are set correctly
2. Check Action logs for detailed errors
3. Ensure HF_SPACE_REPO format is `username/space-name`
4. Verify Vercel tokens are valid

## Production Checklist

- [ ] GitHub repository set up and pushed
- [ ] GitHub Secrets configured
- [ ] HuggingFace Space created
- [ ] Vercel project created and deployed
- [ ] Backend running at HuggingFace Spaces
- [ ] Frontend running on Vercel domain
- [ ] API connection working (test in browser)
- [ ] Login page displays correctly
- [ ] Dashboard loads threat data
- [ ] No console errors in browser
- [ ] SSL/HTTPS working on both frontend and backend
- [ ] CORS errors resolved
- [ ] API keys configured (if using Groq/HuggingFace)

## Useful Links

- **HuggingFace Spaces**: https://huggingface.co/spaces
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: https://github.com/<user>/ai-ngfw/actions
- **FastAPI Docs**: Backend deployed: `/docs`
- **Groq API**: https://console.groq.com
- **HuggingFace Tokens**: https://huggingface.co/settings/tokens

## Rollback

If deployment fails:

### Revert Backend
1. Go to HuggingFace Space settings
2. View deployment history
3. Click "Revert" on previous successful deployment

### Revert Frontend
```bash
vercel rollback
```

Or select previous deployment in Vercel dashboard.

## Monitoring

### Backend Logs
HuggingFace Space → Space Info → Logs

### Frontend Logs
Vercel Dashboard → Project → Deployments → View Logs

### API Health
Visit: `https://ai-ngfw-backend.hf.space/health`

## Support

For deployment issues:
1. Check `.github/workflows/` for automation status
2. Review GitHub Actions logs
3. Check HuggingFace Space build logs
4. Check Vercel deployment logs
5. Verify environment variables
