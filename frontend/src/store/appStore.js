import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Auth state - store in memory, NOT localStorage (security best practice)
  isAuthenticated: false,
  user: null,
  accessToken: null,
  extensionToken: null,
  
  login: (token, user, extensionToken) => {
    set({ 
      isAuthenticated: true, 
      user,
      accessToken: token,
      extensionToken: extensionToken || null
    });
  },
  
  logout: () => {
    set({ 
      isAuthenticated: false, 
      user: null,
      accessToken: null,
      extensionToken: null 
    });
  },
  
  setAccessToken: (token) => set({ accessToken: token }),
  setExtensionToken: (token) => set({ extensionToken: token }),

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
