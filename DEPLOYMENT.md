# AI-NGFW Deployment Guide

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+
- SQLite (included with Python)

### Quick Start

```bash
# 1. Install backend dependencies
pip install -e .

# 2. Install frontend dependencies
cd frontend
npm install
cd ..

# 3. Set environment variables
cp .env.example .env
# Edit .env and add your Groq API key

# 4. Run backend server
python -m backend.main
# Runs on http://localhost:7860

# 5. In another terminal, run frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Visit http://localhost:5173 to access the application.

## Docker Deployment

### Single Container (All-in-One)

```bash
# Build the image
docker build -t ai-ngfw:latest .

# Run the container
docker run -d \
  --name ai-ngfw \
  -p 7860:7860 \
  -e GROQ_API_KEY="your-api-key" \
  -v $(pwd)/ai_ngfw.db:/app/ai_ngfw.db \
  ai-ngfw:latest

# Access at http://localhost:7860
```

### Docker Compose (Recommended for Development)

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your Groq API key
nano .env

# Start services
docker-compose up --build

# Access at http://localhost:7860
```

### Docker Compose Commands

```bash
# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v

# Restart a specific service
docker-compose restart app
```

## Production Deployment

### HuggingFace Spaces

1. **Create a new Space**
   - Visit https://huggingface.co/new-space
   - Choose Docker runtime
   - Select Public or Private

2. **Upload Files**
   ```bash
   git clone https://huggingface.co/spaces/username/ai-ngfw
   cd ai-ngfw
   # Copy project files
   git add .
   git commit -m "Initial commit"
   git push
   ```

3. **Configure Secrets**
   - Add `GROQ_API_KEY` as a Space secret
   - Space will auto-restart and deploy

4. **Access Your Space**
   - Available at `https://huggingface.co/spaces/username/ai-ngfw`

### AWS Deployment (EC2 + RDS)

```bash
# 1. SSH into EC2 instance
ssh -i key.pem ec2-user@your-instance-ip

# 2. Install Docker and Docker Compose
sudo yum install docker docker-compose-plugin -y
sudo systemctl start docker

# 3. Clone and deploy
git clone <repo-url>
cd ai-ngfw
docker-compose up -d

# 4. Configure RDS connection
# Update DATABASE_URL in docker-compose.yml
# postgresql+asyncpg://user:pass@rds-endpoint:5432/ngfw
```

### Kubernetes Deployment

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-ngfw
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ai-ngfw
  template:
    metadata:
      labels:
        app: ai-ngfw
    spec:
      containers:
      - name: ai-ngfw
        image: ai-ngfw:latest
        ports:
        - containerPort: 7860
        env:
        - name: GROQ_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-ngfw-secrets
              key: groq-api-key
        - name: DATABASE_URL
          value: "postgresql+asyncpg://user:pass@postgres:5432/ngfw"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1"
---
apiVersion: v1
kind: Service
metadata:
  name: ai-ngfw-service
spec:
  selector:
    app: ai-ngfw
  type: LoadBalancer
  ports:
  - protocol: TCP
    port: 80
    targetPort: 7860
```

Deploy:
```bash
kubectl create secret generic ai-ngfw-secrets \
  --from-literal=groq-api-key=$GROQ_API_KEY

kubectl apply -f k8s-deployment.yaml
```

## Database Setup

### SQLite (Development)
```bash
# Auto-created on first run
# Located at ./ai_ngfw.db
```

### PostgreSQL (Production)

```bash
# 1. Install PostgreSQL
# On Ubuntu:
sudo apt-get install postgresql postgresql-contrib

# 2. Create database
sudo -u postgres createdb ai_ngfw
sudo -u postgres createuser ngfw_user
sudo -u postgres psql -c "ALTER USER ngfw_user WITH PASSWORD 'password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ai_ngfw TO ngfw_user;"

# 3. Update DATABASE_URL
DATABASE_URL=postgresql+asyncpg://ngfw_user:password@localhost/ai_ngfw

# 4. Run backend to create tables
python -m backend.main
```

## Redis Setup

### Local Redis
```bash
# Install Redis
# On macOS: brew install redis
# On Ubuntu: sudo apt-get install redis-server

# Start Redis
redis-server
```

### Docker Redis
```bash
docker run -d \
  --name ai-ngfw-redis \
  -p 6379:6379 \
  redis:7-alpine
```

## SSL/TLS Configuration

### Using Nginx as Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:7860;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://localhost:7860;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring & Logging

### Application Logging

```python
# Backend logs are sent to stdout and collected by Docker

# View logs
docker logs -f ai-ngfw

# Or with Docker Compose
docker-compose logs -f app
```

### Health Checks

```bash
# Check backend health
curl http://localhost:7860/health

# Check API readiness
curl http://localhost:7860/ready
```

### Prometheus Metrics (Optional)

Add to `backend/main.py`:

```python
from prometheus_client import Counter, Histogram, start_http_server
import time

# Start metrics server on port 8000
start_http_server(8000)

# Define metrics
request_count = Counter('requests_total', 'Total requests', ['method', 'endpoint'])
request_duration = Histogram('request_duration_seconds', 'Request duration')
```

## Performance Tuning

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_threats_severity ON threats(severity);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_traffic_timestamp ON traffic_flows(timestamp DESC);
```

### Redis Caching

```python
import aioredis

redis = await aioredis.from_url("redis://localhost")
cached = await redis.get("threats:list")
await redis.setex("threats:list", 3600, threats_json)  # Expire after 1 hour
```

### Backend Optimization

```python
# Use connection pooling
from sqlalchemy.pool import QueuePool

engine = create_async_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    pool_recycle=3600,
)
```

## Backup & Recovery

### Database Backup

```bash
# SQLite
cp ai_ngfw.db ai_ngfw.db.backup

# PostgreSQL
pg_dump -U ngfw_user ai_ngfw > backup.sql
```

### Restore from Backup

```bash
# PostgreSQL
psql -U ngfw_user ai_ngfw < backup.sql
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs ai-ngfw

# Common issues:
# - Port 7860 already in use: docker ps | grep 7860
# - Missing environment variables: Check docker-compose.yml
# - Database connection: Verify DATABASE_URL format
```

### WebSocket Connection Issues
```bash
# Check proxy configuration
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:7860/ws/threats
```

### High CPU/Memory Usage
```bash
# Limit resources in docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
```

## Security Hardening

1. **Change Default Credentials**
   - Update SECRET_KEY in production
   - Set strong database passwords

2. **Enable HTTPS**
   - Use SSL/TLS certificates
   - Redirect HTTP to HTTPS

3. **API Security**
   - Implement rate limiting
   - Enable CORS restrictions
   - Validate input on all endpoints

4. **Database Security**
   - Use strong passwords
   - Enable connection encryption
   - Regular backups

5. **Container Security**
   - Run as non-root user
   - Use read-only filesystems where possible
   - Scan images for vulnerabilities

## Support

For deployment issues or questions, please:
1. Check the main README.md
2. Review application logs
3. Open a GitHub issue with details
