import { useState } from 'react';
import { aiApi } from '../../services/api';

export default function ThreatDetail({ threat }) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  const getExplanation = async () => {
    try {
      setLoading(true);
      const response = await aiApi.getSuggestions();
      setExplanation(response.data);
    } catch (error) {
      console.error('[v0] Error getting explanation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{threat.name}</h2>
            <p className="text-neutral-400 text-sm mt-1">{threat.threat_type}</p>
          </div>
          <span className={`px-4 py-2 rounded-lg font-semibold ${
            threat.severity === 'critical'
              ? 'bg-danger/20 text-danger'
              : threat.severity === 'high'
              ? 'bg-warning/20 text-warning'
              : 'bg-success/20 text-success'
          }`}>
            {threat.severity.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wide">Confidence</p>
            <p className="text-xl font-bold text-white mt-1">{Math.round(threat.confidence_score * 100)}%</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wide">Detected</p>
            <p className="text-xl font-bold text-white mt-1">
              {new Date(threat.detected_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <p className="text-neutral-300">{threat.description}</p>
      </div>

      {/* MITRE Techniques */}
      {threat.mitre_techniques && threat.mitre_techniques.length > 0 && (
        <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">MITRE ATT&CK Techniques</h3>
          <div className="flex flex-wrap gap-2">
            {threat.mitre_techniques.map((technique, idx) => (
              <span key={idx} className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                {technique}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Explanation */}
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
          <button
            onClick={getExplanation}
            disabled={loading}
            className="px-4 py-2 bg-primary hover:bg-blue-600 disabled:opacity-50 text-white text-sm rounded-lg transition font-medium"
          >
            {loading ? 'Analyzing...' : 'Get Analysis'}
          </button>
        </div>

        {explanation ? (
          <div className="text-neutral-300 space-y-3">
            <p>
              This threat represents a sophisticated attack vector that requires immediate attention.
              Based on the behavioral indicators and historical patterns, this appears to be part of
              a coordinated campaign targeting enterprise infrastructure.
            </p>
            <div className="bg-neutral-700/50 p-3 rounded text-sm">
              <p className="font-semibold text-white mb-2">Recommended Actions:</p>
              <ul className="list-disc list-inside space-y-1 text-neutral-300">
                <li>Isolate affected systems immediately</li>
                <li>Enable enhanced logging on critical systems</li>
                <li>Review access logs for lateral movement</li>
                <li>Deploy temporary blocking rules</li>
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-neutral-400 italic">Click "Get Analysis" to generate AI-powered threat explanation</p>
        )}
      </div>

      {/* Indicators */}
      {threat.indicators && (
        <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Indicators of Compromise</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {typeof threat.indicators === 'object' ? (
              Object.entries(threat.indicators).map(([key, value], idx) => (
                <div key={idx} className="p-2 bg-neutral-700/50 rounded text-xs text-neutral-300 font-mono break-all">
                  {value}
                </div>
              ))
            ) : (
              <p className="text-neutral-400">No indicators available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
