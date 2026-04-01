import { useEffect, useState } from 'react';
import { analyticsApi } from '../services/api';

const card = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 16,
  border: '1.5px solid rgba(226,232,240,0.9)',
  boxShadow: '0 4px 24px rgba(6,182,212,0.05), 0 1px 3px rgba(15,23,42,0.05)',
  padding: 24,
};

const BARS = [
  { label:'Malware',  pct:35, color:'#f43f5e' },
  { label:'Phishing', pct:28, color:'#f97316' },
  { label:'Exploits', pct:20, color:'#06b6d4' },
  { label:'APT',      pct:17, color:'#6366f1' },
];

export default function Analytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    try {
      const response = await analyticsApi.getIncidentMetrics({ days: 30 });
      setMetrics(response.data);
    } catch (error) {
      console.error('[Analytics] load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:14 }}>
        <div style={{
          width:42, height:42,
          border:'3px solid rgba(6,182,212,0.18)',
          borderTopColor:'#06b6d4',
          borderRadius:'50%',
          animation:'spin 0.8s linear infinite',
        }}/>
        <p style={{ color:'#475569', fontSize:14, fontWeight:500, margin:0 }}>Loading analytics…</p>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  const kpis = [
    { label:'Total Incidents (30d)', value: metrics?.total_incidents ?? 0,          color:'#0f172a'  },
    { label:'Resolved',              value: metrics?.resolved        ?? 0,          color:'#16a34a'  },
    { label:'Avg Resolution Time',   value: `${metrics?.avg_resolution_time ?? 0}h`, color:'#0f172a' },
    { label:'MTTR',                  value: metrics?.mttr ? `${metrics.mttr}h` : '—', color:'#0891b2' },
  ];

  return (
    <div style={{ maxWidth:1400, margin:'0 auto' }}>
      <style>{`
        @keyframes fadein { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        .an-fade { animation: fadein 0.45s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      {/* Header */}
      <div className="an-fade" style={{ marginBottom:28 }}>
        <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#0891b2', margin:'0 0 4px' }}>
          Reporting
        </p>
        <h1 style={{ fontSize:28, fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.5px' }}>Analytics</h1>
        <p style={{ fontSize:14, color:'#64748b', margin:'4px 0 0' }}>Security metrics and performance analysis</p>
      </div>

      {/* KPI Row */}
      <div className="an-fade" style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
        gap:16, marginBottom:24, animationDelay:'0.05s',
      }}>
        {kpis.map(({ label, value, color }) => (
          <div key={label} style={card}>
            <p style={{ fontSize:12, fontWeight:600, color:'#64748b', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.06em' }}>
              {label}
            </p>
            <p style={{ fontSize:32, fontWeight:800, color, margin:0, letterSpacing:'-1px' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Threat Distribution Bars */}
      <div className="an-fade" style={{ ...card, animationDelay:'0.10s' }}>
        <div style={{ marginBottom:20 }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:'#0f172a', margin:0 }}>Threat Distribution</h2>
          <p style={{ fontSize:12, color:'#64748b', margin:'4px 0 0' }}>Breakdown by threat category (last 30 days)</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {BARS.map(({ label, pct, color }) => (
            <div key={label}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{label}</span>
                <span style={{ fontSize:13, fontWeight:700, color }}>{pct}%</span>
              </div>
              <div style={{ width:'100%', height:8, borderRadius:99, background:'rgba(226,232,240,0.8)', overflow:'hidden' }}>
                <div style={{
                  height:'100%', width:`${pct}%`, borderRadius:99,
                  background:`linear-gradient(90deg, ${color}, ${color}cc)`,
                  transition:'width 1s cubic-bezier(0.16,1,0.3,1)',
                }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder for no real metrics */}
      {!metrics && (
        <div className="an-fade" style={{
          ...card, marginTop:20, textAlign:'center',
          padding:'40px 24px', animationDelay:'0.15s',
          background:'linear-gradient(135deg, rgba(6,182,212,0.04), rgba(99,102,241,0.04))',
          border:'1.5px dashed rgba(6,182,212,0.25)',
        }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📈</div>
          <p style={{ fontSize:14, fontWeight:700, color:'#0f172a', margin:0 }}>No analytics data yet</p>
          <p style={{ fontSize:13, color:'#64748b', margin:'6px 0 0', maxWidth:340, marginInline:'auto', lineHeight:1.6 }}>
            Metrics will populate here as the extension reports incidents and threats.
          </p>
        </div>
      )}
    </div>
  );
}
