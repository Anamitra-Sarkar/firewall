import { useEffect, useState } from 'react';
import { rulesApi } from '../services/api';

const card = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 16,
  border: '1.5px solid rgba(226,232,240,0.9)',
  boxShadow: '0 4px 24px rgba(6,182,212,0.05), 0 1px 3px rgba(15,23,42,0.05)',
};

const DEFAULT_RULES = [
  { name:'Block Malicious IPs',  desc:'Blocks known malicious IP addresses from threat intel feeds', active:true  },
  { name:'DPI Pattern Matching', desc:'Deep packet inspection for real-time threat signature matching', active:true  },
  { name:'Anomaly Detection',    desc:'AI-powered behavioral anomaly detection engine',               active:true  },
  { name:'DNS Sinkholing',       desc:'Redirects malicious DNS queries to safe endpoints',            active:false },
];

export default function Rules() {
  const [rules, setRules]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRules(); }, []);

  const loadRules = async () => {
    try {
      const response = await rulesApi.getRules();
      setRules(response.data || []);
    } catch (error) {
      console.error('[Rules] load error:', error);
      setRules([]);
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
        <p style={{ color:'#475569', fontSize:14, fontWeight:500, margin:0 }}>Loading rules…</p>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:1400, margin:'0 auto' }}>
      <style>{`
        @keyframes fadein { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        .rl-fade { animation: fadein 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .rl-row:hover td { background: rgba(6,182,212,0.03) !important; }
      `}</style>

      {/* Header */}
      <div className="rl-fade" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#0891b2', margin:'0 0 4px' }}>
            Policy Management
          </p>
          <h1 style={{ fontSize:28, fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.5px' }}>Security Rules</h1>
          <p style={{ fontSize:14, color:'#64748b', margin:'4px 0 0' }}>Firewall and threat detection policies</p>
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
          + New Rule
        </button>
      </div>

      {/* Custom Rules Table */}
      {rules.length > 0 && (
        <div className="rl-fade" style={{ ...card, overflow:'hidden', marginBottom:20, animationDelay:'0.05s' }}>
          <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(226,232,240,0.7)' }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>Custom Rules</h2>
            <p style={{ fontSize:12, color:'#64748b', margin:'2px 0 0' }}>User-defined firewall policies</p>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(226,232,240,0.8)' }}>
                {['Name','Type','Priority','Status','Actions'].map(h => (
                  <th key={h} style={{
                    padding:'12px 20px', textAlign:'left',
                    fontSize:11, fontWeight:700, textTransform:'uppercase',
                    letterSpacing:'0.06em', color:'#94a3b8',
                    background:'rgba(248,250,252,0.6)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, idx) => (
                <tr key={rule.id} className="rl-row"
                  style={{ borderBottom: idx < rules.length-1 ? '1px solid rgba(226,232,240,0.6)' : 'none' }}
                >
                  <td style={{ padding:'14px 20px', fontSize:14, fontWeight:600, color:'#0f172a' }}>{rule.name}</td>
                  <td style={{ padding:'14px 20px', fontSize:13, color:'#64748b' }}>{rule.rule_type}</td>
                  <td style={{ padding:'14px 20px' }}>
                    <span style={{
                      padding:'3px 10px', borderRadius:20,
                      fontSize:11, fontWeight:700,
                      background:'rgba(99,102,241,0.1)', color:'#6366f1',
                      border:'1px solid rgba(99,102,241,0.2)',
                    }}>{rule.priority}</span>
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    {rule.enabled ? (
                      <span style={{ fontSize:13, fontWeight:700, color:'#16a34a' }}>✓ Enabled</span>
                    ) : (
                      <span style={{ fontSize:13, color:'#94a3b8' }}>Disabled</span>
                    )}
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <button style={{
                      padding:'6px 14px', borderRadius:20,
                      background:'rgba(6,182,212,0.08)', color:'#0891b2',
                      border:'1px solid rgba(6,182,212,0.2)',
                      fontSize:12, fontWeight:600, cursor:'pointer',
                      transition:'all 0.18s',
                    }}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(6,182,212,0.15)';e.currentTarget.style.color='#0369a1';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(6,182,212,0.08)';e.currentTarget.style.color='#0891b2';}}
                    >Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Default Rules */}
      <div className="rl-fade" style={{ ...card, padding:0, overflow:'hidden', animationDelay:'0.10s' }}>
        <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(226,232,240,0.7)' }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>Default Security Rules</h2>
          <p style={{ fontSize:12, color:'#64748b', margin:'2px 0 0' }}>Built-in rules active by default — always on</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {DEFAULT_RULES.map((rule, idx) => (
            <div
              key={rule.name}
              style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'16px 20px',
                borderBottom: idx < DEFAULT_RULES.length-1 ? '1px solid rgba(226,232,240,0.6)' : 'none',
                transition:'background 0.18s',
              }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(248,250,252,0.6)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  background: rule.active
                    ? 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(6,182,212,0.08))'
                    : 'rgba(226,232,240,0.5)',
                  border: rule.active ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(226,232,240,0.8)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:16,
                }}>
                  {rule.active ? '🛡️' : '⏸️'}
                </div>
                <div>
                  <p style={{ fontWeight:600, fontSize:14, color:'#0f172a', margin:0 }}>{rule.name}</p>
                  <p style={{ fontSize:12, color:'#64748b', margin:'2px 0 0' }}>{rule.desc}</p>
                </div>
              </div>
              <span style={{
                padding:'4px 12px', borderRadius:20,
                fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0,
                background: rule.active ? 'rgba(34,197,94,0.12)' : 'rgba(226,232,240,0.6)',
                color:       rule.active ? '#16a34a'              : '#94a3b8',
                border:      rule.active ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(226,232,240,0.8)',
              }}>{rule.active ? '✓ Active' : 'Inactive'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
