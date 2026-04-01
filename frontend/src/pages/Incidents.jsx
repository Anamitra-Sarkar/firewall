import { useEffect, useState } from 'react';
import { incidentApi } from '../services/api';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const response = await incidentApi.getIncidents({ limit: 100 });
      setIncidents(response.data);
    } catch (error) {
      console.error('[v0] Incidents load error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Incidents</h1>
          <p className="text-neutral-400 mt-1">Security incident tracking and response</p>
        </div>
        <button className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition">
          + New Incident
        </button>
      </div>

      {/* Incidents Table */}
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-700/50 border-b border-neutral-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-300">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-300">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-300">Severity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-300">Created</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {incidents.length > 0 ? (
              incidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="hover:bg-neutral-700/50 transition"
                >
                  <td className="px-6 py-4 text-white font-medium">{incident.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      incident.status === 'open'
                        ? 'bg-danger/20 text-danger'
                        : incident.status === 'in_progress'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-success/20 text-success'
                    }`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      incident.severity === 'critical'
                        ? 'bg-danger/20 text-danger'
                        : incident.severity === 'high'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-success/20 text-success'
                    }`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400">
                    {new Date(incident.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-primary hover:text-blue-400 transition">
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-neutral-400">
                  No incidents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
