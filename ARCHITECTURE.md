# AI-NGFW Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│                   http://localhost:5173                     │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     REST API         WebSocket         Static Assets
    (axios)          (/ws/threats)      (compiled React)
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────▼────────────────────────┐
        │         FastAPI Backend Server         │
        │      http://localhost:7860              │
        │    - Async/Await Processing            │
        │    - 10 API Routers                     │
        │    - WebSocket Management              │
        └────────┬───────────────────────────────┘
                 │
    ┌────────────┼───────────────┬──────────────┐
    │            │               │              │
    ▼            ▼               ▼              ▼
┌────────┐  ┌────────┐  ┌──────────────┐  ┌──────────┐
│SQLite  │  │ Redis  │  │ Groq API     │  │HuggingFace
│Database│  │ Cache  │  │ (LLM)        │  │(Models)
└────────┘  └────────┘  └──────────────┘  └──────────┘
```

## Component Architecture

### Frontend (React + Vite)

```
frontend/
├── src/
│   ├── pages/                 # Page components
│   │   ├── Dashboard.jsx      # Main SOC dashboard
│   │   ├── Threats.jsx        # Threat intelligence page
│   │   ├── Incidents.jsx      # Incident management
│   │   ├── Analytics.jsx      # Analytics & reporting
│   │   ├── ZeroTrust.jsx      # ZTNA policies
│   │   ├── Rules.jsx          # Security rules
│   │   └── Login.jsx          # Authentication
│   │
│   ├── components/
│   │   ├── Layout.jsx         # Main layout wrapper
│   │   ├── Header.jsx         # Top navigation
│   │   ├── Sidebar.jsx        # Left navigation
│   │   ├── RealTimeThreatStream.jsx  # Live threat feed
│   │   ├── cards/
│   │   │   ├── KPICard.jsx    # Dashboard metrics
│   │   │   └── ThreatDetail.jsx # Threat details view
│   │   └── charts/
│   │       ├── ThreatTimeline.jsx   # Bar chart
│   │       └── TopThreats.jsx       # Pie chart
│   │
│   ├── services/
│   │   └── api.js             # Axios API client
│   │
│   ├── store/
│   │   └── appStore.js        # Zustand state management
│   │
│   ├── hooks/
│   │   ├── useWebSocket.js    # WebSocket connection
│   │   └── useThreatStream.js # Real-time threat stream
│   │
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind styles
│
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind theme
├── postcss.config.js          # PostCSS plugins
└── package.json               # Dependencies
```

### Backend (FastAPI + SQLAlchemy)

```
backend/
├── main.py                    # FastAPI application
├── config.py                  # Settings management
├── database.py                # SQLAlchemy setup
├── models.py                  # ORM models
│
├── routers/                   # API endpoints
│   ├── auth.py               # Authentication (POST /api/auth/login)
│   ├── traffic.py            # Traffic analysis (GET /api/traffic/flows)
│   ├── threats.py            # Threat intel (GET /api/threats)
│   ├── incidents.py          # Incident mgmt (GET /api/incidents)
│   ├── ztna.py               # Zero Trust (POST /api/ztna/evaluate-access)
│   ├── federated_learning.py # FL training (POST /api/federated/train)
│   ├── rules.py              # Rules mgmt (GET /api/rules)
│   ├── analytics.py          # Analytics (GET /api/analytics/dashboard-stats)
│   ├── ai_chat.py            # AI services (POST /api/ai/explain-threat)
│   └── health.py             # Health checks (GET /health)
│
└── services/                  # Business logic
    ├── ai_service.py         # Groq LLM integration
    │   ├── explain_threat()   # AI threat explanation
    │   ├── generate_soar_decision()  # Incident response
    │   └── answer_security_question()  # Chat
    │
    ├── threat_analyzer.py    # DPI & threat detection
    │   └── analyze()          # Traffic analysis
    │
    ├── anomaly_detector.py   # Statistical anomaly detection
    │   ├── detect()           # Flow-based detection
    │   ├── _detect_port_scan()
    │   ├── _detect_c2_pattern()
    │   └── _detect_data_exfil()
    │
    ├── behavioral_analyzer.py # User behavior profiling
    │   ├── analyze()          # Activity analysis
    │   ├── _analyze_login_patterns()
    │   ├── _detect_impossible_travel()
    │   ├── _analyze_access_patterns()
    │   └── _calculate_trust_score()
    │
    └── ws_manager.py         # WebSocket management
        ├── connect()         # Accept connection
        ├── disconnect()      # Remove connection
        └── broadcast()       # Send to all clients
```

### Database Schema

```
users
├── id (PK)
├── username
├── email
├── hashed_password
└── is_active

traffic_flows
├── id (PK)
├── src_ip, dst_ip
├── src_port, dst_port
├── protocol, byte_count
├── anomaly_score
├── timestamp
└── FK: threats

threats
├── id (PK)
├── name, severity
├── threat_type, description
├── confidence_score
├── mitre_techniques (ARRAY)
├── ai_explanation
├── timestamp
└── FK: traffic_flow, incidents

incidents
├── id (PK)
├── title, description
├── status, severity
├── remediation_steps (ARRAY)
├── soar_decision
├── FK: user (assigned_to)
└── M2M: threats

ztna_policies
├── id (PK)
├── name, description
├── device_trust_score_threshold
├── policy_rules (JSON)
└── enabled

federated_models
├── id (PK)
├── model_name, version
├── accuracy, parameters (JSON)
├── global_round, training_data_samples

security_rules
├── id (PK)
├── name, description, rule_type
├── conditions, actions (JSON)
├── priority, enabled
```

## Data Flow Diagrams

### Real-Time Threat Detection Flow

```
Network Traffic
      │
      ▼
┌─────────────────────┐
│ Traffic Capture     │
│ (DPI Engine)        │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Threat       │
    │ Analyzer     │──────┐
    └──────────────┘      │
           │              │
           ▼              ▼
    ┌──────────────┐  ┌──────────────────┐
    │ Anomaly      │  │ Groq AI Service  │
    │ Detector     │  │                  │
    └──────────────┘  │ - Threat explain │
           │          │ - Risk assessment│
           │          └──────────────────┘
           │              │
           └──────┬───────┘
                  │
                  ▼
           ┌─────────────┐
           │ Database    │ (Store threat record)
           │ (Threats)   │
           └──────┬──────┘
                  │
                  ▼
           ┌─────────────┐
           │ WebSocket   │ (Broadcast to dashboard)
           │ Manager     │
           └──────┬──────┘
                  │
                  ▼
           Frontend Dashboard
           (Real-time stream)
```

### Incident Response Flow

```
Threat Detected
      │
      ▼
┌──────────────────┐
│ Create Incident  │
│ (Database)       │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ Groq SOAR Decision       │
│ - Analyze incident       │
│ - Generate actions       │
│ - Risk assessment        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────┐
│ Update Incident  │
│ - Set remediation│
│ - Set priority   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Notify SOC       │
│ (Dashboard)      │
└──────────────────┘
```

### Zero Trust Access Flow

```
User Login Request
      │
      ▼
┌────────────────────────┐
│ Behavioral Analyzer    │
│ - Check login patterns │
│ - Detect anomalies     │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Device Trust Score     │
│ - OS security status   │
│ - Antivirus enabled    │
│ - Encryption status    │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ ZTNA Policy Evaluation │
│ - Trust score check    │
│ - Resource access rule │
│ - Risk-based decision  │
└────────┬───────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
 ALLOW      DENY
(MFA)    (Quarantine)
```

## API Request/Response Flow

### Example: Get Threats with AI Explanation

```
1. Frontend Request
   GET /api/threats?limit=10
   
2. Backend Router (threats.py)
   ├─ Query database for threats
   └─ Return 10 recent threats

3. Frontend Selection
   User clicks on threat
   
4. AI Explanation Request
   POST /api/ai/explain-threat
   {
     "threat_id": 1,
     "threat_name": "Malware.XYZ",
     "severity": "critical",
     ...
   }

5. AI Service Processing
   ├─ Call Groq API
   ├─ Generate explanation
   └─ Return analysis

6. Frontend Display
   ├─ Show threat details
   ├─ Display AI explanation
   └─ Show recommendations
```

## Service Integration Points

### Groq AI Integration
- **Purpose**: LLM-powered threat analysis and SOAR decisions
- **Endpoints**:
  - `/api/ai/explain-threat` - Threat analysis
  - `/api/ai/soar-decision` - Incident response
  - `/api/ai/chat/stream` - Interactive Q&A
- **Models**: Mixtral-8x7b-32768 (default)

### HuggingFace Integration
- **Purpose**: ML-based traffic classification and anomaly detection
- **Models**:
  - Traffic classification model
  - Anomaly detection model
  - Behavioral profiling model
- **Token**: Required in environment variables

### Redis Integration
- **Purpose**: Caching and real-time event broadcasting
- **Use Cases**:
  - Cache threat intelligence
  - Session storage
  - Rate limiting
  - Pub/Sub for WebSocket events

## Security Architecture

### Authentication Flow
```
User Login
    │
    ▼
┌─────────────────────┐
│ Backend Auth Router │
│ - Hash password     │
│ - Generate JWT      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Frontend Store      │
│ - Save token        │
│ - Set auth headers  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ API Requests        │
│ - Include JWT       │
│ - Authorization     │
└─────────────────────┘
```

### Row-Level Security (RLS)
- Users only see their own incidents
- Admins can view all data
- Reports filtered by role

## Scalability Considerations

### Horizontal Scaling
- Stateless FastAPI backend
- Load balancer with multiple instances
- Shared Redis for sessions
- Shared PostgreSQL database

### Vertical Scaling
- Connection pooling (20 connections)
- Query optimization with indexes
- Caching layer with Redis
- Async/await for concurrency

### Performance Optimization
```
├─ Database Level
│  ├─ Indexes on frequently queried columns
│  ├─ Query optimization
│  └─ Connection pooling
│
├─ Application Level
│  ├─ Async/await processing
│  ├─ Caching with Redis
│  └─ Pagination for list endpoints
│
└─ Frontend Level
   ├─ Code splitting with Vite
   ├─ Lazy loading components
   └─ React.memo for optimization
```

## Deployment Architecture

### Development
- Single machine with all services
- SQLite database
- Local Redis (optional)
- Frontend dev server on port 5173

### Production (Docker)
- Multi-stage Docker build
- Containerized FastAPI + Frontend
- PostgreSQL database
- Redis cluster
- Reverse proxy (Nginx)
- SSL/TLS termination

### Cloud Deployment
- Kubernetes orchestration
- Auto-scaling based on load
- Managed database services
- CDN for static assets
- Monitoring and logging stack

## Monitoring & Observability

### Metrics Collected
- Request count and latency
- Threat detection rate
- Incident MTTR
- System resource usage
- API error rates

### Logging
- Application logs to stdout
- Docker log driver configuration
- Centralized log aggregation (optional)
- Structured JSON logging

### Alerting
- WebSocket connection status
- Database connectivity
- API error rates
- Threat spike detection

## Future Enhancements

1. **Machine Learning**
   - Custom threat detection models
   - User behavior analytics
   - Anomaly scoring refinement

2. **Integration**
   - SIEM integration (Splunk, ELK)
   - Ticketing system (Jira, ServiceNow)
   - External threat feeds

3. **Advanced Features**
   - Packet capture and analysis
   - Network visualization
   - Threat hunting tools
   - Compliance reporting

4. **Performance**
   - Graph database for relationships
   - Time-series database for metrics
   - Advanced caching strategies
