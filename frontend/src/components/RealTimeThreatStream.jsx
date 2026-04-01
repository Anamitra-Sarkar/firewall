import { useAppStore } from '../store/appStore';
import { useThreatStream } from '../hooks/useThreatStream';

const severityStyle = (sev) => {
  if (sev === 'critical') return { color: '#dc2626', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' };
  if (sev === 'high')     return { color: '#ea580c', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)' };
  if (sev === 'medium')   return { color: '#b45309', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' };
  return                         { color: '#0891b2', bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.2)'  };
};

export default function RealTimeThreatStream() {
  const threatStream = useAppStore((state) => state.threatStream);
  const { status }   = useThreatStream();
  const isConnected  = status === 'connected';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Real-Time Stream</h2>
          <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Live threats from extension</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 20,
          background: isConnected ? 'rgba(34,197,94,0.08)' : 'rgba(100,116,139,0.08)',
          border: `1px solid ${isConnected ? 'rgba(34,197,94,0.25)' : 'rgba(100,116,139,0.2)'}`,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
            background: isConnected ? '#22c55e' : '#94a3b8',
            boxShadow: isConnected ? '0 0 6px rgba(34,197,94,0.7)' : 'none',
          }}/>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: isConnected ? '#15803d' : '#64748b',
            letterSpacing: '0.04em',
          }}>
            {isConnected ? 'LIVE' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Stream or empty state */}
      {threatStream.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto', paddingRight: 2 }}>
          {threatStream.map((threat, idx) => {
            const s = severityStyle(threat.severity);
            return (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(248,250,252,0.8)',
                  border: `1px solid rgba(226,232,240,0.8)`,
                  borderLeft: `3px solid ${s.color}`,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(241,245,249,0.9)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,250,252,0.8)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 600, color: '#0f172a',
                      margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {threat.name || threat.domain || `Threat #${idx + 1}`}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: s.color, background: s.bg,
                        border: `1px solid ${s.border}`,
                        padding: '2px 7px', borderRadius: 20,
                        textTransform: 'capitalize',
                      }}>
                        {threat.severity || 'low'}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        {threat.threat_type || threat.type || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {new Date(threat.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
            Showing {threatStream.length} recent threats (max 50)
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '32px 20px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(6,182,212,0.04), rgba(99,102,241,0.04))',
          borderRadius: 14, border: '1.5px dashed rgba(6,182,212,0.25)',
          minHeight: 200,
        }}>
          {!isConnected ? (
            <>
              <div style={{ fontSize: 30, marginBottom: 12 }}>🔌</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Extension not active</p>
              <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 16px', maxWidth: 260, lineHeight: 1.6 }}>
                Install the AI-NGFW Chrome extension to see real-time threats as you browse.
              </p>
              <a
                href="/"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 20px', borderRadius: 20,
                  background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                  color: 'white', fontSize: 13, fontWeight: 600,
                  textDecoration: 'none', boxShadow: '0 4px 14px rgba(6,182,212,0.25)',
                }}
              >
                ⬇ Install Extension
              </a>
            </>
          ) : (
            <>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', marginBottom: 12,
                background: 'rgba(34,197,94,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>✅</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#15803d', margin: 0 }}>Extension connected</p>
              <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 0', lineHeight: 1.6 }}>
                Monitoring your browsing — threats will appear here in real time.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
