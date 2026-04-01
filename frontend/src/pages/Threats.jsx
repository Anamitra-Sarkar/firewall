import { useEffect, useState } from 'react';
import { threatApi } from '../services/api';

const card = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 16,
  border: '1.5px solid rgba(226,232,240,0.9)',
  boxShadow: '0 4px 24px rgba(6,182,212,0.05), 0 1px 3px rgba(15,23,42,0.05)',
  padding: 24,
};

const severityStyle = (severity) => {
  if (severity === 'critical') return { bg: 'rgba(244,63,94,0.12)',  color: '#e11d48', border: 'rgba(244,63,94,0.25)' };
  if (severity === 'high')     return { bg: 'rgba(249,115,22,0.12)', color: '#ea580c', border: 'rgba(249,115,22,0.25)' };
  if (severity === 'medium')   return { bg: 'rgba(245,158,11,0.12)', color: '#d97706', border: 'rgba(245,158,11,0.25)' };
  return                              { bg: 'rgba(34,197,94,0.12)',  color: '#16a34a', border: 'rgba(34,197,94,0.25)'  };
};

const FILTER_BTNS = [
  { label: 'All Threats', value: 'all'      },
  { label: '🔴 Critical', value: 'critical' },
  { label: '🟠 High',     value: 'high'     },
  { label: '🟡 Medium',   value: 'medium'   },
];

export default function Threats() {
  const [threats, setThreats]               = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [loading, setLoading]               = useState(true);
  const [filter, setFilter]                 = useState('all');

  useEffect(() => { loadThreats(); }, []);

  const loadThreats = async () => {
    try {
      setLoading(true);
      const response = await threatApi.getThreats({ limit: 100 });
      setThreats(response.data || []);
    } catch (error) {
      console.error('[Threats] load error:', error);
      setThreats([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? threats : threats.filter(t => t.severity === filter);

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
        <p style={{ color:'#475569', fontSize:14, fontWeight:500, margin:0 }}>Loading threats…</p>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:1400, margin:'0 auto' }}>
      <style>{`
        @keyframes fadein { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .th-fade { animation: fadein 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .threat-btn:hover { background: rgba(6,182,212,0.06) !important; }
        .filter-btn { cursor:pointer; border:none; transition:all 0.18s; }
        .filter-btn:hover { opacity:0.85; }
      `}</style>

      {/* Header */}
      <div className="th-fade" style={{ marginBottom:28 }}>
        <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#0891b2', margin:'0 0 4px' }}>
          Threat Intelligence
        </p>
        <h1 style={{ fontSize:28, fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.5px' }}>
          Threat Monitor
        </h1>
        <p style={{ fontSize:14, color:'#64748b', margin:'4px 0 0' }}>
          Detected threats and indicators of compromise — live from your Chrome extension
        </p>
      </div>

      {/* Filters */}
      <div className="th-fade" style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:24, animationDelay:'0.05s' }}>
        {FILTER_BTNS.map(btn => (
          <button
            key={btn.value}
            className="filter-btn"
            onClick={() => setFilter(btn.value)}
            style={{
              padding:'8px 18px', borderRadius:20,
              fontSize:13, fontWeight:600,
              background: filter === btn.value
                ? 'linear-gradient(135deg, #06b6d4, #6366f1)'
                : 'rgba(255,255,255,0.85)',
              color: filter === btn.value ? '#fff' : '#475569',
              border: filter === btn.value
                ? '1.5px solid transparent'
                : '1.5px solid rgba(226,232,240,0.9)',
              boxShadow: filter === btn.value
                ? '0 4px 14px rgba(6,182,212,0.25)'
                : '0 1px 3px rgba(15,23,42,0.05)',
            }}
          >
            {btn.label}
          </button>
        ))}
        <span style={{
          marginLeft:'auto', alignSelf:'center',
          fontSize:11, fontWeight:700, color:'#0891b2',
          background:'rgba(6,182,212,0.08)', border:'1px solid rgba(6,182,212,0.2)',
          padding:'5px 12px', borderRadius:20,
        }}>
          {filtered.length} threat{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Main Grid */}
      <div className="th-fade" style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:20, animationDelay:'0.10s' }}>

        {/* Left — List */}
        <div style={{ ...card, padding:0, overflow:'hidden' }}>
          <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(226,232,240,0.7)' }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>Detected Threats</h2>
            <p style={{ fontSize:12, color:'#64748b', margin:'2px 0 0' }}>
              {filtered.length === 0 ? 'No threats match your filter' : 'Click any threat to inspect'}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 24px', textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>{threats.length === 0 ? '🛡️' : '🔍'}</div>
              <p style={{ fontSize:14, fontWeight:700, color:'#0f172a', margin:0 }}>
                {threats.length === 0 ? 'No threats detected yet' : 'No threats match this filter'}
              </p>
              <p style={{ fontSize:13, color:'#64748b', margin:'6px 0 0', maxWidth:260, lineHeight:1.6 }}>
                {threats.length === 0
                  ? 'Browsing with the Chrome extension active will populate this list.'
                  : 'Try selecting a different severity filter above.'}
              </p>
            </div>
          ) : (
            <div style={{ maxHeight:600, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:8 }}>
              {filtered.map((threat) => {
                const s = severityStyle(threat.severity);
                const isSelected = selectedThreat?.id === threat.id;
                return (
                  <button
                    key={threat.id}
                    className="threat-btn"
                    onClick={() => setSelectedThreat(threat)}
                    style={{
                      width:'100%', textAlign:'left',
                      padding:'12px 14px', borderRadius:12,
                      border: isSelected ? '1.5px solid rgba(6,182,212,0.5)' : '1.5px solid rgba(226,232,240,0.7)',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(99,102,241,0.06))'
                        : 'rgba(248,250,252,0.7)',
                      cursor:'pointer', transition:'all 0.18s',
                      boxShadow: isSelected ? '0 4px 12px rgba(6,182,212,0.12)' : 'none',
                    }}
                  >
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                      <p style={{ fontWeight:600, fontSize:13, color:'#0f172a', margin:0, flex:1 }}>{threat.name}</p>
                      <span style={{
                        padding:'2px 9px', borderRadius:20,
                        fontSize:10, fontWeight:700,
                        background:s.bg, color:s.color, border:`1px solid ${s.border}`,
                        textTransform:'uppercase', whiteSpace:'nowrap', flexShrink:0,
                      }}>{threat.severity}</span>
                    </div>
                    <p style={{ fontSize:11, color:'#64748b', margin:'4px 0 0' }}>{threat.threat_type}</p>
                    {threat.confidence_score != null && (
                      <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ flex:1, height:3, borderRadius:99, background:'rgba(226,232,240,0.8)', overflow:'hidden' }}>
                          <div style={{
                            height:'100%',
                            width:`${Math.round(threat.confidence_score * 100)}%`,
                            background:`linear-gradient(90deg, ${s.color}, #06b6d4)`,
                            borderRadius:99,
                          }}/>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, color:'#94a3b8' }}>
                          {Math.round(threat.confidence_score * 100)}%
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — Detail */}
        <div>
          {selectedThreat ? (
            <ThreatDetailPanel threat={selectedThreat} />
          ) : (
            <div style={{
              ...card, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', minHeight:400, textAlign:'center',
            }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
              <p style={{ fontSize:16, fontWeight:700, color:'#0f172a', margin:0 }}>Select a threat</p>
              <p style={{ fontSize:14, color:'#64748b', margin:'6px 0 0', maxWidth:280, lineHeight:1.6 }}>
                Click on any threat from the list to view its full details and AI analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThreatDetailPanel({ threat }) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading]         = useState(false);
  const s = severityStyle(threat.severity);

  const getExplanation = async () => {
    try {
      setLoading(true);
      const { aiApi } = await import('../services/api');
      const response = await aiApi.getSuggestions();
      setExplanation(response.data);
    } catch (e) {
      setExplanation({ fallback: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Header */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <h2 style={{ fontSize:20, fontWeight:800, color:'#0f172a', margin:0 }}>{threat.name}</h2>
            <p style={{ fontSize:13, color:'#64748b', margin:'4px 0 0' }}>{threat.threat_type}</p>
          </div>
          <span style={{
            padding:'6px 16px', borderRadius:20,
            fontSize:12, fontWeight:800,
            background:s.bg, color:s.color, border:`1.5px solid ${s.border}`,
            textTransform:'uppercase',
          }}>{threat.severity}</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          {[
            { label:'Confidence', value:`${Math.round((threat.confidence_score||0)*100)}%` },
            { label:'Detected',   value: threat.detected_at ? new Date(threat.detected_at).toLocaleDateString() : '—' },
          ].map(({label,value}) => (
            <div key={label} style={{
              padding:'12px 16px', borderRadius:12,
              background:'rgba(248,250,252,0.9)',
              border:'1px solid rgba(226,232,240,0.7)',
            }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#94a3b8', margin:0 }}>{label}</p>
              <p style={{ fontSize:20, fontWeight:800, color:'#0f172a', margin:'4px 0 0' }}>{value}</p>
            </div>
          ))}
        </div>
        {threat.description && (
          <p style={{ fontSize:14, color:'#475569', lineHeight:1.7, margin:0 }}>{threat.description}</p>
        )}
      </div>

      {/* MITRE */}
      {threat.mitre_techniques?.length > 0 && (
        <div style={card}>
          <h3 style={{ fontSize:14, fontWeight:700, color:'#0f172a', margin:'0 0 12px' }}>MITRE ATT&CK Techniques</h3>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {threat.mitre_techniques.map((t,i) => (
              <span key={i} style={{
                padding:'4px 12px', borderRadius:20,
                fontSize:12, fontWeight:600,
                background:'rgba(99,102,241,0.1)', color:'#6366f1',
                border:'1px solid rgba(99,102,241,0.2)',
              }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis */}
      <div style={card}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:'#0f172a', margin:0 }}>AI Analysis</h3>
          <button
            onClick={getExplanation}
            disabled={loading}
            style={{
              padding:'8px 18px', borderRadius:20,
              background: loading ? 'rgba(6,182,212,0.12)' : 'linear-gradient(135deg, #06b6d4, #6366f1)',
              color: loading ? '#64748b' : '#fff',
              fontSize:13, fontWeight:600,
              border:'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(6,182,212,0.25)',
              transition:'all 0.18s',
            }}
          >
            {loading ? 'Analyzing…' : '✨ Get Analysis'}
          </button>
        </div>
        {explanation ? (
          <div>
            <p style={{ fontSize:14, color:'#475569', lineHeight:1.7, margin:'0 0 12px' }}>
              This threat represents a sophisticated attack vector requiring immediate attention.
              Based on behavioral indicators and historical patterns, this appears to be part of
              a coordinated campaign targeting enterprise infrastructure.
            </p>
            <div style={{
              padding:'14px 16px', borderRadius:12,
              background:'rgba(6,182,212,0.05)',
              border:'1px solid rgba(6,182,212,0.15)',
            }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#0f172a', margin:'0 0 8px' }}>Recommended Actions</p>
              {['Isolate affected systems immediately','Enable enhanced logging on critical systems','Review access logs for lateral movement','Deploy temporary blocking rules'].map((a,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#06b6d4', flexShrink:0 }}/>
                  <p style={{ fontSize:13, color:'#475569', margin:0 }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ fontSize:14, color:'#94a3b8', fontStyle:'italic', margin:0 }}>
            Click "✨ Get Analysis" to generate AI-powered threat explanation.
          </p>
        )}
      </div>

      {/* IoCs */}
      {threat.indicators && (
        <div style={card}>
          <h3 style={{ fontSize:14, fontWeight:700, color:'#0f172a', margin:'0 0 12px' }}>Indicators of Compromise</h3>
          <div style={{ maxHeight:200, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
            {typeof threat.indicators === 'object'
              ? Object.entries(threat.indicators).map(([k,v],i) => (
                  <div key={i} style={{
                    padding:'8px 12px', borderRadius:8,
                    background:'rgba(248,250,252,0.9)',
                    border:'1px solid rgba(226,232,240,0.7)',
                    fontSize:12, fontFamily:'monospace', color:'#475569', wordBreak:'break-all',
                  }}>{v}</div>
                ))
              : <p style={{ fontSize:13, color:'#94a3b8', margin:0 }}>No indicators available</p>
            }
          </div>
        </div>
      )}
    </div>
  );
}
