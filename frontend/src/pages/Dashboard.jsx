import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { analyticsApi, threatApi, incidentApi } from '../services/api';
import KPICard from '../components/cards/KPICard';
import ThreatTimeline from '../components/charts/ThreatTimeline';
import TopThreats from '../components/charts/TopThreats';
import RealTimeThreatStream from '../components/RealTimeThreatStream';

const statusStyle = (status) => {
  if (status === 'open')        return { bg: 'rgba(239,68,68,0.08)',   color: '#dc2626',  border: 'rgba(239,68,68,0.2)' };
  if (status === 'in_progress') return { bg: 'rgba(245,158,11,0.08)', color: '#d97706',  border: 'rgba(245,158,11,0.2)' };
  return                               { bg: 'rgba(34,197,94,0.08)',  color: '#16a34a',  border: 'rgba(34,197,94,0.2)' };
};

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [threats, setThreats]     = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [s, t, i] = await Promise.all([
        analyticsApi.getDashboardStats({ hours: 24 }),
        threatApi.getThreats({ limit: 10 }),
        incidentApi.getIncidents({ limit: 5 }),
      ]);
      setStats(s.data);
      setThreats(t.data);
      setIncidents(i.data);
    } catch (err) {
      console.error('[Dashboard] load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{
          width: 40, height: 40, border: '3px solid rgba(6,182,212,0.2)',
          borderTopColor: '#06b6d4', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}/>
        <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Loading dashboard…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <style>{`@keyframes fadein { from { opacity:0; transform:translateY(10px);} to { opacity:1; transform:translateY(0);} }`}</style>

      {/* Page header */}
      <div style={{ marginBottom: 28, animation: 'fadein 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0891b2', margin: 0 }}>
            Security Operations Center
          </p>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0' }}>Real-time security overview</p>
      </div>

      {/* KPI row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 16, marginBottom: 24, animation: 'fadein 0.5s ease 0.05s both',
      }}>
        <KPICard title="Total Threats"    value={stats?.total_threats    || 0} change="+12%" icon="⚠️"  trend="up"   />
        <KPICard title="Critical Threats" value={stats?.critical_threats || 0} change="-8%"  icon="🚨" trend="down" variant="critical" />
        <KPICard title="Active Incidents" value={stats?.active_incidents || 0} change="+3%"  icon="🔴" trend="up"   />
        <KPICard title="Blocked Traffic"  value={`${stats?.blocked_traffic || 0} GB`} change="+25%" icon="🛡️" trend="up" variant="success" />
      </div>

      {/* Charts + stream */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 340px',
        gap: 20, marginBottom: 24,
        animation: 'fadein 0.5s ease 0.1s both',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)',
            borderRadius: 16, border: '1.5px solid rgba(226,232,240,0.9)',
            boxShadow: '0 4px 24px rgba(6,182,212,0.05)', padding: 20,
          }}>
            <ThreatTimeline threats={threats} />
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)',
            borderRadius: 16, border: '1.5px solid rgba(226,232,240,0.9)',
            boxShadow: '0 4px 24px rgba(6,182,212,0.05)', padding: 20,
          }}>
            <TopThreats threats={threats} />
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)',
          borderRadius: 16, border: '1.5px solid rgba(226,232,240,0.9)',
          boxShadow: '0 4px 24px rgba(6,182,212,0.05)', padding: 20,
          height: 'fit-content',
        }}>
          <RealTimeThreatStream />
        </div>
      </div>

      {/* Recent incidents */}
      <div style={{
        background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)',
        borderRadius: 16, border: '1.5px solid rgba(226,232,240,0.9)',
        boxShadow: '0 4px 24px rgba(6,182,212,0.05)', padding: '24px 28px',
        animation: 'fadein 0.5s ease 0.15s both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Incidents</h2>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Latest security incidents requiring attention</p>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#0891b2',
            background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
            padding: '4px 10px', borderRadius: 20,
          }}>{incidents.length} total</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {incidents.length > 0 ? incidents.map((inc) => {
            const s = statusStyle(inc.status);
            return (
              <div key={inc.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', borderRadius: 12,
                background: 'rgba(248,250,252,0.8)',
                border: '1px solid rgba(226,232,240,0.7)',
                transition: 'all 0.18s',
                cursor: 'default',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(241,245,249,0.9)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,250,252,0.8)'}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a', margin: 0 }}>{inc.title}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>{inc.description}</p>
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
          }) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#16a34a', margin: 0 }}>No active incidents</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Your network is clean</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
