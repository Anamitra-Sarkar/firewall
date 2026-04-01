const card = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 16,
  border: '1.5px solid rgba(226,232,240,0.9)',
  boxShadow: '0 4px 24px rgba(6,182,212,0.05), 0 1px 3px rgba(15,23,42,0.05)',
  padding: 24,
};

const SESSIONS = [
  { email:'john.doe@company.com',  device:'MacBook Pro',   ip:'192.168.1.100', status:'trusted',  trust:92 },
  { email:'jane.smith@company.com',device:'Windows 11',    ip:'10.0.0.50',     status:'at_risk',  trust:65 },
  { email:'dev@company.com',       device:'Ubuntu 22.04',  ip:'172.16.0.12',   status:'trusted',  trust:78 },
];

const POLICIES = [
  { name:'Corporate Network Access',desc:'Trust score required: 80% · Behavioral analysis enabled', active:true  },
  { name:'Sensitive Data Access',   desc:'Trust score required: 95% · MFA required',                active:true  },
  { name:'Guest Wi-Fi Isolation',   desc:'No internal network access · Bandwidth throttled',         active:false },
];

const trustColor = (score) => {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#d97706';
  return '#e11d48';
};

const trustBg = (score) => {
  if (score >= 80) return { bg:'rgba(34,197,94,0.12)',  color:'#16a34a', border:'rgba(34,197,94,0.25)',  label:'Trusted'  };
  if (score >= 60) return { bg:'rgba(245,158,11,0.12)', color:'#d97706', border:'rgba(245,158,11,0.25)', label:'At Risk'  };
  return                  { bg:'rgba(244,63,94,0.12)',  color:'#e11d48', border:'rgba(244,63,94,0.25)',  label:'Blocked'  };
};

export default function ZeroTrust() {
  return (
    <div style={{ maxWidth:1400, margin:'0 auto' }}>
      <style>{`
        @keyframes fadein { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        .zt-fade { animation: fadein 0.45s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      {/* Header */}
      <div className="zt-fade" style={{ marginBottom:28 }}>
        <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#0891b2', margin:'0 0 4px' }}>
          Access Control
        </p>
        <h1 style={{ fontSize:28, fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.5px' }}>
          Zero Trust Network Access
        </h1>
        <p style={{ fontSize:14, color:'#64748b', margin:'4px 0 0' }}>
          Device trust scoring and user behavioral analysis
        </p>
      </div>

      <div className="zt-fade" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20, animationDelay:'0.05s' }}>

        {/* Active Sessions */}
        <div style={{ ...card, padding:0, overflow:'hidden' }}>
          <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(226,232,240,0.7)' }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>Active Sessions</h2>
            <p style={{ fontSize:12, color:'#64748b', margin:'2px 0 0' }}>{SESSIONS.length} sessions currently active</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {SESSIONS.map((s, idx) => {
              const t = trustBg(s.trust);
              return (
                <div
                  key={s.email}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'14px 20px',
                    borderBottom: idx < SESSIONS.length-1 ? '1px solid rgba(226,232,240,0.6)' : 'none',
                    transition:'background 0.18s',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(248,250,252,0.6)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{
                      width:36, height:36, borderRadius:'50%', flexShrink:0,
                      background:`linear-gradient(135deg, ${t.color}22, ${t.color}11)`,
                      border:`1.5px solid ${t.border}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:14, fontWeight:800, color:t.color,
                    }}>
                      {s.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight:600, fontSize:13, color:'#0f172a', margin:0 }}>{s.email}</p>
                      <p style={{ fontSize:11, color:'#64748b', margin:'2px 0 0' }}>{s.ip} · {s.device}</p>
                    </div>
                  </div>
                  <span style={{
                    padding:'4px 12px', borderRadius:20,
                    fontSize:11, fontWeight:700,
                    background:t.bg, color:t.color, border:`1px solid ${t.border}`,
                    whiteSpace:'nowrap', flexShrink:0,
                  }}>{t.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device Trust Scores */}
        <div style={card}>
          <h2 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:'0 0 18px' }}>Device Trust Scores</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {SESSIONS.map(s => {
              const c = trustColor(s.trust);
              return (
                <div key={s.device}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{s.device}</span>
                    <span style={{ fontSize:13, fontWeight:800, color:c }}>{s.trust}%</span>
                  </div>
                  <div style={{ width:'100%', height:8, borderRadius:99, background:'rgba(226,232,240,0.8)', overflow:'hidden' }}>
                    <div style={{
                      height:'100%', width:`${s.trust}%`, borderRadius:99,
                      background:`linear-gradient(90deg, ${c}, ${c}aa)`,
                      transition:'width 1s cubic-bezier(0.16,1,0.3,1)',
                    }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Access Policies */}
      <div className="zt-fade" style={{ ...card, padding:0, overflow:'hidden', animationDelay:'0.10s' }}>
        <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(226,232,240,0.7)' }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>Access Policies</h2>
          <p style={{ fontSize:12, color:'#64748b', margin:'2px 0 0' }}>Active zero-trust enforcement rules</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column' }}>
          {POLICIES.map((p, idx) => (
            <div
              key={p.name}
              style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'16px 20px',
                borderBottom: idx < POLICIES.length-1 ? '1px solid rgba(226,232,240,0.6)' : 'none',
                transition:'background 0.18s',
              }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(248,250,252,0.6)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  background: p.active ? 'rgba(6,182,212,0.1)' : 'rgba(226,232,240,0.5)',
                  border: p.active ? '1px solid rgba(6,182,212,0.2)' : '1px solid rgba(226,232,240,0.8)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
                }}>
                  {p.active ? '🔒' : '🔓'}
                </div>
                <div>
                  <p style={{ fontWeight:600, fontSize:14, color:'#0f172a', margin:0 }}>{p.name}</p>
                  <p style={{ fontSize:12, color:'#64748b', margin:'2px 0 0' }}>{p.desc}</p>
                </div>
              </div>
              <span style={{
                padding:'4px 12px', borderRadius:20,
                fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0,
                background: p.active ? 'rgba(34,197,94,0.12)'    : 'rgba(226,232,240,0.6)',
                color:       p.active ? '#16a34a'                 : '#94a3b8',
                border:      p.active ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(226,232,240,0.8)',
              }}>{p.active ? '✓ Enabled' : 'Disabled'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
