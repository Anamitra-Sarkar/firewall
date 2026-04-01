# AI-Driven Next-Generation Firewall (AI-NGFW)

A production-grade cybersecurity platform featuring AI-powered threat detection, Zero Trust architecture, real-time incident response, and federated learning for distributed threat intelligence.

## Features

### Core Security Capabilities
- **AI-Powered Threat Detection**: Groq-based LLM analysis for threat explanation and contextualization
- **Zero Trust Network Access (ZTNA)**: Device trust scoring, behavioral biometrics, and granular access control
- **Real-Time Threat Intelligence**: Live threat stream via WebSockets with threat timeline and MITRE ATT&CK mapping
- **Incident Response & SOAR**: Automated incident response decisions with remediation recommendations
- **Behavioral Analytics**: User and device behavior profiling for anomaly detection and account compromise detection
- **Federated Learning**: Distributed ML model training across network segments for collaborative threat detection

### Advanced Analysis
- **Deep Packet Inspection (DPI)**: Protocol analysis and traffic classification
- **Anomaly Detection**: Statistical and ML-based anomaly detection in network flows
- **Threat Explanation**: AI-generated explanations for detected threats with attack chain analysis
- **MITRE ATT&CK Mapping**: Automatic mapping of detected threats to MITRE techniques and tactics

### Dashboard & Reporting
- **Real-Time SOC Dashboard**: KPI cards, threat timeline, attack distribution charts
- **Incident Management**: Full incident lifecycle tracking with status and severity management
- **Analytics & Metrics**: MTTR calculation, incident trends, threat distribution analysis
- **Policy Management**: Rule editor with priority-based firewall and behavioral rules

## Architecture

### Backend
- **Framework**: FastAPI with async/await for high performance
- **Database**: SQLAlchemy ORM with SQLite (dev) / PostgreSQL (production)
- **AI/ML**:
  - Groq API for LLM-based threat analysis
  - HuggingFace models for traffic classification and anomaly detection
  - Statistical methods for anomaly detection
- **Real-Time**: WebSocket support for live threat streaming
- **Services**: 12+ specialized services for DPI, anomaly detection, behavioral analysis, ZTNA, SOAR

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with dark theme optimized for SOC operations
- **State Management**: Zustand for global state
- **Charts**: Recharts for data visualization
- **API Client**: Axios with request interceptors for authentication

### Infrastructure
- **Containerization**: Docker multi-stage build for optimized images
- **Orchestration**: Docker Compose for local development
- **Services**: Redis for caching and pub/sub

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (optional, for containerized deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd ai-ngfw
   ```

2. **Backend Setup**
   ```bash
   # Create Python environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -e .
   
   # Set environment variables
   cp .env.example .env
   # Edit .env with your Groq API key
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install  # or pnpm install / yarn install
   ```

4. **Run Development Servers**

   Terminal 1 - Backend:
   ```bash
   python -m backend.main
   # Backend runs on http://localhost:7860
   ```

   Terminal 2 - Frontend:
   ```bash
   cd frontend
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - API Docs: http://localhost:7860/docs

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Application will be available at http://localhost:7860
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Traffic Analysis
- `GET /api/traffic/flows` - Get traffic flows
- `POST /api/traffic/analyze` - Analyze traffic for threats

### Threat Intelligence
- `GET /api/threats` - List threats
- `POST /api/threats` - Create threat record
- `POST /api/ai/explain-threat` - Get AI explanation

### Incident Management
- `GET /api/incidents` - List incidents
- `POST /api/incidents` - Create incident
- `PUT /api/incidents/{id}` - Update incident

### Zero Trust
- `POST /api/ztna/evaluate-access` - Evaluate access decision
- `POST /api/ztna/device-trust-score` - Calculate device trust

### Analytics
- `GET /api/analytics/dashboard-stats` - Dashboard statistics
- `GET /api/analytics/threat-timeline` - Threat timeline

### Real-Time
- `WS /ws/threats` - WebSocket for real-time threat stream

## Environment Variables

```env
# Database
DATABASE_URL=sqlite:///./ai_ngfw.db

# Groq API
GROQ_API_KEY=your_groq_api_key_here

# Frontend
REACT_APP_API_URL=http://localhost:7860/api
```

## Database Models

- **User**: User accounts and authentication
- **TrafficFlow**: Network traffic records with anomaly scores
- **Threat**: Detected threats with severity and confidence
- **Incident**: Security incidents with status tracking
- **ZeroTrustPolicy**: ZTNA policies and access rules
- **SecurityRule**: Firewall and behavioral rules

## License

This project is licensed under the MIT License.

## Support

For issues and feature requests, please open a GitHub issue with detailed information.
