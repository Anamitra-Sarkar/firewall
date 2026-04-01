import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

const navItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    name: 'Threats',
    path: '/dashboard/threats',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    name: 'Incidents',
    path: '/dashboard/incidents',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    name: 'Analytics',
    path: '/dashboard/analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    name: 'Zero Trust',
    path: '/dashboard/zero-trust',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    name: 'Rules',
    path: '/dashboard/rules',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const location     = useLocation();
  const sidebarOpen  = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <aside
      style={{
        width: sidebarOpen ? 220 : 68,
        transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(226,232,240,0.9)',
        display: 'flex', flexDirection: 'column',
        height: '100%',
        boxShadow: '2px 0 16px rgba(6,182,212,0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Logo row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarOpen ? 'space-between' : 'center',
        padding: '18px 16px',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        minHeight: 64,
      }}>
        {sidebarOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-label="AI-NGFW">
              <rect width="28" height="28" rx="7" fill="#06b6d4"/>
              <path d="M7 21L14 7L21 21" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M9.5 16.5L18.5 16.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', letterSpacing: '-0.3px' }}>AI-NGFW</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          style={{
            padding: '6px', borderRadius: 8, border: 'none',
            background: 'transparent', color: '#64748b',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            transition: 'background 0.18s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          aria-label="Toggle sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: sidebarOpen ? '10px 14px' : '10px 0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                borderRadius: 10, textDecoration: 'none',
                fontWeight: active ? 700 : 500,
                fontSize: 13.5,
                color: active ? '#0891b2' : '#475569',
                background: active ? 'rgba(6,182,212,0.10)' : 'transparent',
                transition: 'all 0.18s', position: 'relative',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {active && (
                <span style={{
                  position: 'absolute', left: 0, top: '20%',
                  height: '60%', width: 3, borderRadius: 2, background: '#06b6d4',
                }}/>
              )}
              <span style={{ color: active ? '#06b6d4' : '#94a3b8', flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(226,232,240,0.8)',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
        justifyContent: sidebarOpen ? 'flex-start' : 'center',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#22c55e',
          boxShadow: '0 0 6px rgba(34,197,94,0.7)',
          flexShrink: 0, display: 'inline-block',
        }}/>
        {sidebarOpen && (
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Online · v0.1.0</span>
        )}
      </div>
    </aside>
  );
}
