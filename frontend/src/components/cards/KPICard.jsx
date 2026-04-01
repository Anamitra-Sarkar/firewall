export default function KPICard({ title, value, change, icon, trend, variant = 'default' }) {
  const variants = {
    default: {
      border: 'rgba(6,182,212,0.18)',
      glow:   'rgba(6,182,212,0.06)',
      accent: '#0891b2',
      bg:     'rgba(6,182,212,0.04)',
    },
    critical: {
      border: 'rgba(239,68,68,0.2)',
      glow:   'rgba(239,68,68,0.06)',
      accent: '#dc2626',
      bg:     'rgba(239,68,68,0.04)',
    },
    success: {
      border: 'rgba(34,197,94,0.2)',
      glow:   'rgba(34,197,94,0.06)',
      accent: '#15803d',
      bg:     'rgba(34,197,94,0.04)',
    },
    warning: {
      border: 'rgba(245,158,11,0.2)',
      glow:   'rgba(245,158,11,0.06)',
      accent: '#b45309',
      bg:     'rgba(245,158,11,0.04)',
    },
  };
  const v = variants[variant] || variants.default;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1.5px solid ${v.border}`,
        borderRadius: 16,
        padding: '22px 24px',
        boxShadow: `0 4px 24px ${v.glow}, 0 1px 3px rgba(15,23,42,0.05)`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 10px 32px ${v.glow}, 0 2px 8px rgba(15,23,42,0.07)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 4px 24px ${v.glow}, 0 1px 3px rgba(15,23,42,0.05)`;
      }}
    >
      <div style={{
        position: 'absolute', top: -24, right: -24,
        width: 88, height: 88, borderRadius: '50%',
        background: v.glow, filter: 'blur(20px)', pointerEvents: 'none',
      }}/>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{
            fontSize: 11.5, fontWeight: 700, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0,
          }}>{title}</p>
          <p style={{
            fontSize: 34, fontWeight: 800, color: '#0f172a',
            margin: '6px 0 0', letterSpacing: '-1.5px', lineHeight: 1,
          }}>{value}</p>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: v.bg, border: `1px solid ${v.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {change && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 12, fontWeight: 700,
            color: trend === 'up' ? '#dc2626' : '#15803d',
            background: trend === 'up' ? 'rgba(239,68,68,0.09)' : 'rgba(34,197,94,0.09)',
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
