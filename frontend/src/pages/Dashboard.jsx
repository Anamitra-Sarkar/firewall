import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { analyticsApi, threatApi, incidentApi } from '../services/api';
import KPICard from '../components/cards/KPICard';
import ThreatTimeline from '../components/charts/ThreatTimeline';
import TopThreats from '../components/charts/TopThreats';
import RealTimeThreatStream from '../components/RealTimeThreatStream';

const statusStyle = (status) => {
  if (status === 'open')        return { bg: 'rgba(239,68,68,0.08)',   color: '#dc2626', border: 'rgba(239,68,68,0.2)' };
  if (status === 'in_progress') return { bg: 'rgba(245,158,11,0.08)', color: '#b45309', border: 'rgba(245,158,11,0.2)' };
  return                               { bg: 'rgba(34,197,94,0.08)',  color: '#15803d', border: 'rgba(34,197,94,0.2)'  };
};

const card = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 16,
  border: '1.5px solid rgba(226,232,240,0.9)',
  boxShadow: '0 4px 24px rgba(6,182,212,0.05), 0 1px 3px rgba(15,23,42,0.05)',
  padding: 24,
};

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [threats, setThreats]     = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, t, i] = await Promise.all([
        analyticsApi.getDashboardStats({ hours: 24 }),
        threatApi.getThreats({ limit: 100 }),
        incidentApi.getIncidents({ limit: 5 }),
      ]);
      setStats(s.data);
      setThreats(t.data || []);
      setIncidents(i.data || []);
    } catch (err) {
      console.error('[Dashboard] load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '60vh', flexDirection: 'column', gap: 14,
      }}>
        <div style={{
          width: 42, height: 42,
          border: '3px solid rgba(6,182,212,0.18)',
          borderTopColor: '#06b6d4',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}/>
        <p style={{ color: '#475569', fontSize: 14, fontWeight: 500, margin: 0 }}>Loading dashboard…</p>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  const hasThreats   = threats.length > 0;
  const hasIncidents = incidents.length > 0;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <style>{`
        @keyframes fadein { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .db-fade { animation: fadein 0.45s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      {/* Page header */}
      <div className="db-fade" style={{ marginBottom: 28 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: '#0891b2', margin: '0 0 4px',
        }}>Security Operations Center</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0' }}>Real-time security overview — powered by your Chrome extension</p>
      </div>

      {/* Extension notice if no data */}
      {!hasThreats && (
        <div
          className="db-fade"
          style={{
            marginBottom: 24,
            padding: '16px 20px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(99,102,241,0.06))',
            border: '1.5px solid rgba(6,182,212,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.12))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>🛡️</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>No threat data yet</p>
              <p style={{ fontSize: 13, color: '#475569', margin: '2px 0 0' }}>
                Install the AI-NGFW Chrome extension to start monitoring your browsing in real time.
              </p>
            </div>
          </div>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 22px', borderRadius: 20, flexShrink: 0,
              background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
              color: 'white', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', boxShadow: '0 4px 14px rgba(6,182,212,0.25)',
              whiteSpace: 'nowrap',
            }}
          >⬇ Get Extension →</Link>
        </div>
      )}

      {/* KPI row */}
      <div
        className="db-fade"
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16, marginBottom: 24,
          animationDelay: '0.05s',
        }}
      >
        <KPICard title="Total Threats"    value={stats?.total_threats    ?? 0} change={hasThreats ? '+12%' : null} icon="⚠️"  trend="up"   />
        <KPICard title="Critical Threats" value={stats?.critical_threats ?? 0} change={hasThreats ? '-8%'  : null} icon="🚨" trend="down" variant="critical" />
        <KPICard title="Active Incidents" value={stats?.active_incidents ?? 0} change={hasThreats ? '+3%'  : null} icon="🔴" trend="up" variant="warning" />
        <KPICard title="Blocked Traffic"  value={`${stats?.blocked_traffic ?? 0} GB`} change={hasThreats ? '+25%' : null} icon="🛡️" trend="up" variant="success" />
      </div>

      {/* Charts + stream */}
      <div
        className="db-fade"
        style={{
          display: 'grid', gridTemplateColumns: '1fr 340px',
          gap: 20, marginBottom: 24,
          animationDelay: '0.10s',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <ThreatTimeline threats={threats} />
          </div>
          <div style={card}>
            <TopThreats threats={threats} />
          </div>
        </div>
        <div style={{ ...card, height: 'fit-content', padding: 20 }}>
          <RealTimeThreatStream />
        </div>
      </div>

      {/* Recent incidents */}
      <div className="db-fade" style={{ ...card, padding: '24px 28px', animationDelay: '0.15s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Incidents</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Latest security incidents requiring attention</p>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#0891b2',
            background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
            padding: '4px 10px', borderRadius: 20,
          }}>{incidents.length} total</span>
        </div>

        {hasIncidents ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {incidents.map((inc) => {
              const s = statusStyle(inc.status);
              return (
                <div
                  key={inc.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', borderRadius: 12,
                    background: 'rgba(248,250,252,0.8)',
                    border: '1px solid rgba(226,232,240,0.7)',
                    transition: 'background 0.18s', cursor: 'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(241,245,249,0.9)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,250,252,0.8)'}
                >
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a', margin: 0 }}>{inc.title}</p>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>{inc.description}</p>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: 20,
                    fontSize: 11, fontWeight: 700,
                    background: s.bg, color: s.color,
                    border: `1px solid ${s.border}`,
                    textTransform: 'capitalize', whiteSpace: 'nowrap',
                  }}>{inc.status.replace('_', ' ')}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '40px 20px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.04), rgba(6,182,212,0.04))',
            borderRadius: 12, border: '1.5px dashed rgba(34,197,94,0.25)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#15803d', margin: 0 }}>No active incidents</p>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Your network is clean — incidents reported by the extension will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
