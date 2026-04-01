import { useAppStore } from '../store/appStore';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const user     = useAppStore((s) => s.user);
  const logout   = useAppStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const displayName = user?.username || 'Admin User';
  const initials    = displayName.slice(0, 2).toUpperCase();

  return (
    <header style={{
      background: 'rgba(255,255,255,0.90)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(226,232,240,0.9)',
      padding: '0 28px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 12px rgba(6,182,212,0.07)',
      flexShrink: 0,
    }}>
      {/* Left: logo + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-label="AI-NGFW">
          <rect width="28" height="28" rx="7" fill="#06b6d4"/>
          <path d="M7 21L14 7L21 21" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M9.5 16.5L18.5 16.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', letterSpacing: '-0.3px' }}>AI-NGFW</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Security Operations Center</span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Live badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 20,
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.25)',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: '#22c55e',
            boxShadow: '0 0 6px rgba(34,197,94,0.7)',
            display: 'inline-block',
          }}/>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#15803d', letterSpacing: '0.04em' }}>LIVE</span>
        </div>

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0,
          }}>{initials}</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{displayName}</p>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>SOC Operator</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            padding: '7px 16px', borderRadius: 20,
            border: '1.5px solid rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.06)',
            color: '#dc2626', fontSize: 12.5, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.3)'; }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
