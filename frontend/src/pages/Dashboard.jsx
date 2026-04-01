import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { analyticsApi, threatApi, incidentApi } from '../services/api';
import KPICard from '../components/cards/KPICard';
import ThreatTimeline from '../components/charts/ThreatTimeline';
import TopThreats from '../components/charts/TopThreats';
import RealTimeThreatStream from '../components/RealTimeThreatStream';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsResponse = await analyticsApi.getDashboardStats({ hours: 24 });
      setStats(statsResponse.data);
      
      // Load recent threats
      const threatsResponse = await threatApi.getThreats({ limit: 10 });
      setThreats(threatsResponse.data);
      
      // Load incidents
      const incidentsResponse = await incidentApi.getIncidents({ limit: 5 });
      setIncidents(incidentsResponse.data);
    } catch (error) {
      console.error('[v0] Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-neutral-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-neutral-400 mt-1">Real-time security overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Threats"
          value={stats?.total_threats || 0}
          change="+12%"
          icon="⚠️"
          trend="up"
        />
        <KPICard
          title="Critical Threats"
          value={stats?.critical_threats || 0}
          change="-8%"
          icon="🚨"
          trend="down"
          variant="critical"
        />
        <KPICard
          title="Active Incidents"
          value={stats?.active_incidents || 0}
          change="+3%"
          icon="🔴"
          trend="up"
        />
        <KPICard
          title="Blocked Traffic"
          value={`${stats?.blocked_traffic || 0} GB`}
          change="+25%"
          icon="🛡️"
          trend="up"
          variant="success"
        />
      </div>

      {/* Charts and Real-Time Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-6">
            <ThreatTimeline threats={threats} />
            <TopThreats threats={threats} />
          </div>
        </div>
        <div>
          <RealTimeThreatStream />
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Incidents</h2>
        <div className="space-y-3">
          {incidents.length > 0 ? (
            incidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition"
              >
                <div>
                  <p className="font-medium text-white">{incident.title}</p>
                  <p className="text-xs text-neutral-400 mt-1">{incident.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  incident.status === 'open'
                    ? 'bg-danger/20 text-danger'
                    : incident.status === 'in_progress'
                    ? 'bg-warning/20 text-warning'
                    : 'bg-success/20 text-success'
                }`}>
                  {incident.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-neutral-400 text-center py-6">No incidents detected</p>
          )}
        </div>
      </div>
    </div>
  );
}
