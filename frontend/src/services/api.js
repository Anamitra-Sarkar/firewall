import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7860/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const threatApi = {
  getThreats: (params) => api.get('/threats', { params }),
  getThreatById: (id) => api.get(`/threats/${id}`),
  createThreat: (data) => api.post('/threats', data),
  explainThreat: (data) => api.post('/ai/explain-threat', data),
};

export const incidentApi = {
  getIncidents: (params) => api.get('/incidents', { params }),
  getIncidentById: (id) => api.get(`/incidents/${id}`),
  createIncident: (data) => api.post('/incidents', data),
  updateIncident: (id, data) => api.put(`/incidents/${id}`, data),
  resolveIncident: (id) => api.post(`/incidents/${id}/resolve`),
  getSoarDecision: (data) => api.post('/ai/soar-decision', data),
};

export const trafficApi = {
  getFlows: (params) => api.get('/traffic/flows', { params }),
  getStatistics: (params) => api.get('/traffic/statistics', { params }),
  analyzeTraffic: (data) => api.post('/traffic/analyze', data),
};

export const analyticsApi = {
  getDashboardStats: (params) => api.get('/analytics/dashboard-stats', { params }),
  getThreatTimeline: (params) => api.get('/analytics/threat-timeline', { params }),
  getTopThreats: (params) => api.get('/analytics/top-threats', { params }),
  getAttackMap: () => api.get('/analytics/attack-map'),
  getIncidentMetrics: (params) => api.get('/analytics/incident-metrics', { params }),
};

export const aiApi = {
  chat: (data) => api.post('/ai/chat/stream', data),
  getSuggestions: () => api.get('/ai/suggestions'),
};

export const ztnaApi = {
  evaluateAccess: (data) => api.post('/ztna/evaluate-access', data),
  getDeviceTrustScore: (data) => api.post('/ztna/device-trust-score', data),
  getPolicies: () => api.get('/ztna/policies'),
  getAccessLogs: (params) => api.get('/ztna/access-logs', { params }),
};

export const rulesApi = {
  getRules: () => api.get('/rules'),
  getRuleById: (id) => api.get(`/rules/${id}`),
  createRule: (data) => api.post('/rules', data),
  updateRule: (id, data) => api.put(`/rules/${id}`, data),
  deleteRule: (id) => api.delete(`/rules/${id}`),
  enableRule: (id) => api.post(`/rules/${id}/enable`),
  disableRule: (id) => api.post(`/rules/${id}/disable`),
};

export default api;
