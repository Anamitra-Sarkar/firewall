# AI-NGFW API Reference

Complete API documentation for the AI-NGFW backend server.

## Base URL

```
http://localhost:7860
```

## Authentication

Currently, the API uses token-based authentication via JWT. Pass tokens in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Content Type

All requests must use `Content-Type: application/json`.

## Response Format

All responses follow a standard format:

```json
{
  "data": {},
  "error": null,
  "status": 200
}
```

## Endpoints

### Health & Status

#### GET `/`

Check API health and status.

**Response:**
```json
{
  "message": "AI-NGFW API",
  "version": "1.0.0",
  "docs": "/docs"
}
```

**Example:**
```bash
curl http://localhost:7860
```

---

### Threat Analysis (Browser Extension)

#### POST `/api/v1/incidents/analyze`

Analyze a network request for threats. This endpoint is designed for the browser extension to call on every network request.

**Request:**
```json
{
  "url": "https://example.com/login",
  "domain": "example.com",
  "protocol": "https:",
  "method": "GET",
  "timestamp": "2024-01-15T10:30:00Z",
  "tabId": 12345,
  "source": "popup"
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | ✓ | Full request URL |
| domain | string | ✓ | Domain name (without protocol) |
| protocol | string | ✓ | Protocol: `http:`, `https:`, etc. |
| method | string | ✗ | HTTP method (default: GET) |
| timestamp | string | ✗ | ISO 8601 timestamp |
| tabId | integer | ✗ | Chrome tab ID (for tracking) |
| source | string | ✗ | Source of request (popup, background, content) |

**Response:**
```json
{
  "threat_score": 0.85,
  "threat_type": "phishing",
  "is_threat": true,
  "reason": "Known phishing domain",
  "cached": false
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| threat_score | float | 0.0 - 1.0, higher = more threatening |
| threat_type | string \| null | Type: phishing, malware, suspicious, etc. |
| is_threat | boolean | true if threat_score > threshold |
| reason | string | Human-readable explanation |
| cached | boolean | true if response was from cache |

**Status Codes:**

| Code | Meaning |
|------|---------|
| 200 | Analysis successful |
| 400 | Invalid request format |
| 500 | Server error during analysis |

**Example Request:**
```bash
curl -X POST http://localhost:7860/api/v1/incidents/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://suspicious-domain.com/login",
    "domain": "suspicious-domain.com",
    "protocol": "https:",
    "method": "GET",
    "timestamp": "2024-01-15T10:30:00Z"
  }'
```

**Example Responses:**

Safe request:
```json
{
  "threat_score": 0.1,
  "threat_type": null,
  "is_threat": false,
  "reason": "Request analyzed",
  "cached": false
}
```

Suspicious request:
```json
{
  "threat_score": 0.85,
  "threat_type": "phishing",
  "is_threat": true,
  "reason": "Potential phishing",
  "cached": false
}
```

---

### Incidents Management

#### GET `/api/incidents`

Retrieve all incidents (requires authentication).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (open, resolved, closed) |
| limit | integer | Max results (default: 100, max: 1000) |

**Response:**
```json
[
  {
    "id": 1,
    "title": "Malware Detection",
    "description": "Potential malware detected on example.com",
    "status": "open",
    "severity": "high",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "remediation_steps": ["Block domain", "Clear cache"]
  }
]
```

**Example:**
```bash
curl "http://localhost:7860/api/incidents?status=open&limit=50"
```

---

#### GET `/api/incidents/{id}`

Get a specific incident (requires authentication).

**Response:**
```json
{
  "id": 1,
  "title": "Malware Detection",
  "description": "Potential malware detected on example.com",
  "status": "open",
  "severity": "high",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "remediation_steps": ["Block domain", "Clear cache"]
}
```

**Example:**
```bash
curl http://localhost:7860/api/incidents/1
```

---

#### POST `/api/incidents`

Create a new incident (requires authentication).

**Request:**
```json
{
  "title": "Suspicious Activity",
  "description": "Unusual request pattern detected",
  "severity": "medium",
  "threat_ids": [1, 2, 3]
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | ✓ | Incident title |
| description | string | ✓ | Detailed description |
| severity | string | ✗ | low, medium, high, critical |
| threat_ids | array | ✗ | Related threat IDs |

**Response:**
```json
{
  "id": 2,
  "title": "Suspicious Activity",
  "description": "Unusual request pattern detected",
  "status": "open",
  "severity": "medium",
  "created_at": "2024-01-15T10:31:00Z",
  "updated_at": "2024-01-15T10:31:00Z",
  "remediation_steps": []
}
```

**Example:**
```bash
curl -X POST http://localhost:7860/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Phishing Attempt",
    "description": "User attempted to click phishing link",
    "severity": "high"
  }'
```

---

#### PUT `/api/incidents/{id}`

Update an incident (requires authentication).

**Request:**
```json
{
  "status": "resolved",
  "description": "Updated description",
  "remediation_steps": ["Blocked domain", "Notified user"]
}
```

**Request Fields:** (all optional)

| Field | Type | Description |
|-------|------|-------------|
| status | string | open, resolved, closed |
| description | string | Updated description |
| remediation_steps | array | List of remediation steps |

**Response:** Updated incident object

**Example:**
```bash
curl -X PUT http://localhost:7860/api/incidents/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "remediation_steps": ["Domain blocked", "Cache cleared"]
  }'
```

---

#### POST `/api/incidents/{id}/resolve`

Resolve an incident (requires authentication).

**Response:**
```json
{
  "status": "resolved"
}
```

**Example:**
```bash
curl -X POST http://localhost:7860/api/incidents/1/resolve
```

---

### Traffic Analysis

#### GET `/api/traffic`

Get traffic analysis data (requires authentication).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| time_range | string | last_hour, last_24h, last_7d |
| source | string | Filter by source IP/domain |

**Response:**
```json
{
  "total_requests": 1500,
  "total_threats": 42,
  "threat_rate": 2.8,
  "top_domains": [
    {"domain": "google.com", "count": 450},
    {"domain": "github.com", "count": 320}
  ],
  "threat_types": {
    "phishing": 15,
    "malware": 12,
    "suspicious": 15
  }
}
```

---

### Threat Intelligence

#### GET `/api/threats`

Get threat intelligence data (requires authentication).

**Response:**
```json
{
  "known_malware_domains": 5000,
  "known_phishing_urls": 3000,
  "last_update": "2024-01-15T10:00:00Z",
  "threat_level": "elevated"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "detail": "Error message",
  "status_code": 400
}
```

**Common Error Codes:**

| Code | Meaning |
|------|---------|
| 400 | Bad request (invalid JSON, missing fields) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found (resource doesn't exist) |
| 500 | Internal server error |

**Example Error Response:**
```json
{
  "detail": "Invalid request format",
  "status_code": 400
}
```

---

## Rate Limiting

Currently, there is no rate limiting on the `/api/incidents/analyze` endpoint to allow rapid requests from the browser extension.

For other endpoints, implement rate limiting in production:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705329000
```

---

## CORS Headers

The API includes CORS headers for browser extension:

```
Access-Control-Allow-Origin: chrome-extension://*
Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## API Examples

### Example 1: Analyze Request in Extension

```javascript
async function analyzeRequest(url, domain, protocol, method) {
  const response = await fetch('http://localhost:7860/api/v1/incidents/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url,
      domain: domain,
      protocol: protocol,
      method: method,
      timestamp: new Date().toISOString(),
    }),
  });

  const analysis = await response.json();
  return analysis.is_threat; // true or false
}

// Usage
const isThreat = await analyzeRequest(
  'https://example.com/login',
  'example.com',
  'https:',
  'GET'
);

if (isThreat) {
  console.log('Request blocked!');
}
```

### Example 2: Get All Incidents

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:7860/api/incidents?limit=50"
```

### Example 3: Create and Resolve Incident

```bash
# Create incident
curl -X POST http://localhost:7860/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Phishing Attempt",
    "severity": "high"
  }'

# Resolve incident (use returned ID)
curl -X POST http://localhost:7860/api/incidents/1/resolve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Performance Metrics

**Expected Performance:**

- `/api/incidents/analyze`: <50ms (with cache), <100ms (cache miss)
- `/api/incidents`: <200ms
- `/api/threats`: <100ms
- Database query: <10ms

**Caching Strategy:**

- Request analysis results cached for 1 hour
- Threat intelligence cached for 6 hours
- Manual cache clear available in extension

---

## API Versioning

Current API version: **v1.0.0**

Future versions will be available at `/api/v2/`, `/api/v3/`, etc. to maintain backward compatibility.

---

## Authentication

To authenticate API requests, include your JWT token:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:7860/api/incidents
```

---

## WebSocket Endpoints

#### WS `/ws/threats`

Real-time threat stream via WebSocket.

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:7860/ws/threats');

ws.onmessage = (event) => {
  const threat = JSON.parse(event.data);
  console.log('New threat detected:', threat);
};

ws.send(JSON.stringify({
  action: 'subscribe',
  threat_types: ['malware', 'phishing']
}));
```

---

## Documentation

- **Swagger UI**: http://localhost:7860/docs
- **ReDoc**: http://localhost:7860/redoc
- **OpenAPI Schema**: http://localhost:7860/openapi.json

---

## Support

For API issues:
- Check the logs in the terminal where the backend is running
- Review the Swagger UI at `/docs`
- Enable DEBUG=true in `.env` for verbose logging

