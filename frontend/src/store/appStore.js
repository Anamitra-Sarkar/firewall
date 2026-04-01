import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Auth state
  isAuthenticated: !!localStorage.getItem('auth_token'),
  user: null,
  login: (token, user) => {
    localStorage.setItem('auth_token', token);
    set({ isAuthenticated: true, user });
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ isAuthenticated: false, user: null });
  },

  // Threats
  threats: [],
  setThreats: (threats) => set({ threats }),
  addThreat: (threat) => set((state) => ({ threats: [threat, ...state.threats] })),

  // Incidents
  incidents: [],
  setIncidents: (incidents) => set({ incidents }),
  updateIncidentStatus: (id, status) =>
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id ? { ...inc, status } : inc
      ),
    })),

  // Dashboard
  dashboardStats: null,
  setDashboardStats: (stats) => set({ dashboardStats: stats }),

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Real-time updates
  threatStream: [],
  addThreatStream: (threat) =>
    set((state) => ({
      threatStream: [threat, ...state.threatStream].slice(0, 50),
    })),
}));
