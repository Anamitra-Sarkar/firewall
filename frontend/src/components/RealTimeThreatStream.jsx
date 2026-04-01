import { useAppStore } from '../store/appStore';
import { useThreatStream } from '../hooks/useThreatStream';

export default function RealTimeThreatStream() {
  const threatStream = useAppStore((state) => state.threatStream);
  const { status } = useThreatStream();

  return (
    <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Real-Time Threat Stream</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'connected' ? 'bg-success animate-pulse' : 'bg-neutral-500'
          }`}></div>
          <span className="text-xs font-medium text-neutral-400">
            {status === 'connected' ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {threatStream.length > 0 ? (
          threatStream.map((threat, idx) => (
            <div
              key={idx}
              className="p-3 bg-neutral-700/50 rounded-lg border-l-4 border-danger hover:bg-neutral-700 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">
                    {threat.name || `Threat ${idx + 1}`}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {threat.threat_type || 'Unknown'} • 
                    <span className={`ml-1 font-semibold ${
                      threat.severity === 'critical' ? 'text-danger' : 'text-warning'
                    }`}>
                      {threat.severity || 'Medium'}
                    </span>
                  </p>
                </div>
                <span className="text-xs text-neutral-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-neutral-400 text-center py-8 text-sm">
            Waiting for threat detections...
          </p>
        )}
      </div>

      {threatStream.length > 0 && (
        <p className="text-xs text-neutral-400 mt-4 text-center">
          Showing {threatStream.length} recent threats (max 50)
        </p>
      )}
    </div>
  );
}
