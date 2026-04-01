import { useEffect, useState } from 'react';
import { threatApi } from '../services/api';
import ThreatDetail from '../components/cards/ThreatDetail';

export default function Threats() {
  const [threats, setThreats] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThreats();
  }, []);

  const loadThreats = async () => {
    try {
      setLoading(true);
      const response = await threatApi.getThreats({ limit: 100 });
      setThreats(response.data);
    } catch (error) {
      console.error('[v0] Threats load error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Threat Intelligence</h1>
        <p className="text-neutral-400 mt-1">Detected threats and indicators of compromise</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition">
          All Threats
        </button>
        <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition">
          🔴 Critical
        </button>
        <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition">
          🟠 High
        </button>
        <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition">
          🟡 Medium
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threats List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Threats ({threats.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {threats.map((threat) => (
                <button
                  key={threat.id}
                  onClick={() => setSelectedThreat(threat)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedThreat?.id === threat.id
                      ? 'bg-primary/20 border border-primary'
                      : 'bg-neutral-700/50 hover:bg-neutral-700 border border-transparent'
                  }`}
                >
                  <p className="font-medium text-white text-sm">{threat.name}</p>
                  <p className="text-xs text-neutral-400 mt-1">{threat.threat_type}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded ${
                    threat.severity === 'critical'
                      ? 'bg-danger/20 text-danger'
                      : threat.severity === 'high'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-success/20 text-success'
                  }`}>
                    {threat.severity}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
          {selectedThreat ? (
            <ThreatDetail threat={selectedThreat} />
          ) : (
            <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-8 text-center">
              <p className="text-neutral-400">Select a threat to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
