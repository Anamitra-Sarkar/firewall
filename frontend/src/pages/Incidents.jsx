import { useEffect, useState } from 'react';
import { incidentApi } from '../services/api';

const card = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 16,
  border: '1.5px solid rgba(226,232,240,0.9)',
  boxShadow: '0 4px 24px rgba(6,182,212,0.05), 0 1px 3px rgba(15,23,42,0.05)',
};

const statusStyle = (status) => {
  if (status === 'open')        return { bg:'rgba(244,63,94,0.12)',  color:'#e11d48', border:'rgba(244,63,94,0.25)',  label:'Open'        };
  if (status === 'in_progress') return { bg:'rgba(245,158,11,0.12)', color:'#d97706', border:'rgba(245,158,11,0.25)', label:'In Progress'  };
  return                               { bg:'rgba(34,197,94,0.12)',  color:'#16a34a', border:'rgba(34,197,94,0.25)',  label:'Resolved'    };
};

const severityStyle = (severity) => {
  if (severity === 'critical') return { bg:'rgba(244,63,94,0.12)',  color:'#e11d48', border:'rgba(244,63,94,0.25)'  };
  if (severity === 'high')     return { bg:'rgba(249,115,22,0.12)', color:'#ea580c', border:'rgba(249,115,22,0.25)' };
  if (severity === 'medium')   return { bg:'rgba(245,158,11,0.12)', color:'#d97706', border:'rgba(245,158,11,0.25)' };
  return                              { bg:'rgba(34,197,94,0.12)',  color:'#16a34a', border:'rgba(34,197,94,0.25)'  };
};

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { loadIncidents(); }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const response = await incidentApi.getIncidents({ limit: 100 });
      setIncidents(response.data || []);
    } catch (error) {
      console.error('[Incidents] load error:', error);
      setIncidents([]);
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
        <p style={{ color:'#475569', fontSize:14, fontWeight:500, margin:0 }}>Loading incidents…</p>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:1400, margin:'0 auto' }}>
      <style>{`
        @keyframes fadein { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        .inc-fade { animation: fadein 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .inc-row:hover td { background: rgba(6,182,212,0.03) !important; }
      `}</style>

      {/* Header */}
      <div className="inc-fade" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#0891b2', margin:'0 0 4px' }}>
            Security Operations Center
          </p>
          <h1 style={{ fontSize:28, fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.5px' }}>Incidents</h1>
          <p style={{ fontSize:14, color:'#64748b', margin:'4px 0 0' }}>Security incident tracking and response</p>
        </div>
        <button
          style={{
            padding:'10px 22px', borderRadius:20, flexShrink:0,
            background:'linear-gradient(135deg, #06b6d4, #6366f1)',
            color:'#fff', fontSize:14, fontWeight:600,
            border:'none', cursor:'pointer',
            boxShadow:'0 4px 14px rgba(6,182,212,0.25)',
            transition:'opacity 0.18s',
          }}
          onMouseEnter={e=>e.currentTarget.style.opacity='0.88'}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}
        >
          + New Incident
        </button>
      </div>

      {/* Table */}
      <div className="inc-fade" style={{ ...card, overflow:'hidden', animationDelay:'0.05s' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(226,232,240,0.8)' }}>
              {['Title','Status','Severity','Created','Actions'].map(h => (
                <th key={h} style={{
                  padding:'14px 20px', textAlign:'left',
                  fontSize:11, fontWeight:700, textTransform:'uppercase',
                  letterSpacing:'0.06em', color:'#94a3b8',
                  background:'rgba(248,250,252,0.6)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents.length > 0 ? (
              incidents.map((inc, idx) => {
                const st = statusStyle(inc.status);
                const sv = severityStyle(inc.severity);
                return (
                  <tr
                    key={inc.id}
                    className="inc-row"
                    style={{ borderBottom: idx < incidents.length-1 ? '1px solid rgba(226,232,240,0.6)' : 'none' }}
                  >
                    <td style={{ padding:'16px 20px' }}>
                      <p style={{ fontWeight:600, fontSize:14, color:'#0f172a', margin:0 }}>{inc.title}</p>
                      {inc.description && (
                        <p style={{ fontSize:12, color:'#64748b', margin:'3px 0 0' }}>{inc.description}</p>
                      )}
                    </td>
                    <td style={{ padding:'16px 20px' }}>
                      <span style={{
                        padding:'4px 12px', borderRadius:20,
                        fontSize:11, fontWeight:700,
                        background:st.bg, color:st.color, border:`1px solid ${st.border}`,
                        whiteSpace:'nowrap',
                      }}>{st.label}</span>
                    </td>
                    <td style={{ padding:'16px 20px' }}>
                      {inc.severity ? (
                        <span style={{
                          padding:'4px 12px', borderRadius:20,
                          fontSize:11, fontWeight:700,
                          background:sv.bg, color:sv.color, border:`1px solid ${sv.border}`,
                          textTransform:'capitalize', whiteSpace:'nowrap',
                        }}>{inc.severity}</span>
                      ) : <span style={{ color:'#94a3b8', fontSize:13 }}>—</span>}
                    </td>
                    <td style={{ padding:'16px 20px', fontSize:13, color:'#64748b', whiteSpace:'nowrap' }}>
                      {inc.created_at ? new Date(inc.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                    </td>
                    <td style={{ padding:'16px 20px' }}>
                      <button
                        style={{
                          padding:'6px 14px', borderRadius:20,
                          background:'rgba(6,182,212,0.08)', color:'#0891b2',
                          border:'1px solid rgba(6,182,212,0.2)',
                          fontSize:12, fontWeight:600, cursor:'pointer',
                          transition:'all 0.18s',
                        }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(6,182,212,0.15)'; e.currentTarget.style.color='#0369a1';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='rgba(6,182,212,0.08)'; e.currentTarget.style.color='#0891b2';}}
                      >View</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ padding:'56px 20px', textAlign:'center' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                    <div style={{ fontSize:36 }}>✅</div>
                    <p style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>No incidents found</p>
                    <p style={{ fontSize:13, color:'#64748b', margin:0, maxWidth:320, lineHeight:1.6 }}>
                      Security incidents reported by the extension will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
