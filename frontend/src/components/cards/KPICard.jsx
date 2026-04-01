export default function KPICard({ title, value, change, icon, trend, variant = 'default' }) {
  const variants = {
    default: {
      border: 'rgba(6,182,212,0.15)',
      glow:   'rgba(6,182,212,0.06)',
      accent: '#0891b2',
    },
    critical: {
      border: 'rgba(239,68,68,0.2)',
      glow:   'rgba(239,68,68,0.06)',
      accent: '#dc2626',
    },
    success: {
      border: 'rgba(34,197,94,0.2)',
      glow:   'rgba(34,197,94,0.06)',
      accent: '#16a34a',
    },
  };
  const v = variants[variant] || variants.default;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1.5px solid ${v.border}`,
        borderRadius: 16,
        padding: '22px 24px',
        boxShadow: `0 4px 24px ${v.glow}, 0 1px 3px rgba(15,23,42,0.06)`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 32px ${v.glow}, 0 2px 8px rgba(15,23,42,0.08)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 4px 24px ${v.glow}, 0 1px 3px rgba(15,23,42,0.06)`;
      }}
    >
      {/* Subtle corner glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80,
        borderRadius: '50%',
        background: v.glow,
        filter: 'blur(16px)',
        pointerEvents: 'none',
      }}/>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{title}</p>
          <p style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '6px 0 0', letterSpacing: '-1px', lineHeight: 1 }}>{value}</p>
        </div>
        <div style={{
          width: 44, height: 44,
          borderRadius: 12,
          background: `${v.glow}`,
          border: `1px solid ${v.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {change && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 12, fontWeight: 700,
            color: trend === 'up' ? '#dc2626' : '#16a34a',
            background: trend === 'up' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
            padding: '3px 8px', borderRadius: 20,
          }}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>vs last period</span>
        </div>
      )}
    </div>
  );
}
