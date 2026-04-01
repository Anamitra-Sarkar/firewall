import { useEffect, useState } from 'react';
import { analyticsApi } from '../services/api';

export default function Analytics() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await analyticsApi.getIncidentMetrics({ days: 30 });
      setMetrics(response.data);
    } catch (error) {
      console.error('[v0] Analytics load error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics & Reporting</h1>
        <p className="text-neutral-400 mt-1">Security metrics and performance analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <p className="text-neutral-400 text-sm">Total Incidents (30d)</p>
          <p className="text-3xl font-bold text-white mt-2">{metrics?.total_incidents || 0}</p>
        </div>
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <p className="text-neutral-400 text-sm">Resolved</p>
          <p className="text-3xl font-bold text-success mt-2">{metrics?.resolved || 0}</p>
        </div>
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <p className="text-neutral-400 text-sm">Avg Resolution Time</p>
          <p className="text-3xl font-bold text-white mt-2">{metrics?.avg_resolution_time || 0}h</p>
        </div>
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <p className="text-neutral-400 text-sm">MTTR</p>
          <p className="text-3xl font-bold text-primary mt-2">4.2h</p>
        </div>
      </div>

      <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Threat Distribution</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-300">Malware</span>
              <span className="text-sm text-white">35%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div className="bg-danger h-2 rounded-full" style={{ width: '35%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-300">Phishing</span>
              <span className="text-sm text-white">28%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div className="bg-warning h-2 rounded-full" style={{ width: '28%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-300">Exploits</span>
              <span className="text-sm text-white">20%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-300">APT</span>
              <span className="text-sm text-white">17%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: '17%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
