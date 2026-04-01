import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAppStore } from '../store/appStore';

export const useThreatStream = () => {
  const { data, status, error } = useWebSocket(`ws://localhost:7860/ws/threats`);
  const addThreatStream = useAppStore((state) => state.addThreatStream);

  useEffect(() => {
    if (data && status === 'connected') {
      try {
        // Parse threat data from WebSocket message
        const threat = typeof data === 'string' ? JSON.parse(data) : data;
        if (threat.id || threat.name) {
          console.log('[v0] New threat received:', threat.name);
          addThreatStream(threat);
        }
      } catch (e) {
        console.error('[v0] Error processing threat:', e);
      }
    }
  }, [data, status, addThreatStream]);

  return { status, error };
};
