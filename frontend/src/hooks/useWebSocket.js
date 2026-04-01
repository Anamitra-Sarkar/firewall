import { useEffect, useState, useCallback, useRef } from 'react';

export const useWebSocket = (url) => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = url || `${protocol}//${window.location.host}/ws/threats`;
        
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          console.log('[v0] WebSocket connected');
          setStatus('connected');
          setError(null);
        };

        ws.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            setData(message);
          } catch (e) {
            console.log('[v0] Raw message:', event.data);
            setData(event.data);
          }
        };

        ws.current.onerror = (error) => {
          console.error('[v0] WebSocket error:', error);
          setError('WebSocket error');
          setStatus('error');
        };

        ws.current.onclose = () => {
          console.log('[v0] WebSocket disconnected');
          setStatus('disconnected');
          // Attempt reconnection after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
      } catch (e) {
        console.error('[v0] WebSocket connection failed:', e);
        setError(e.message);
        setStatus('error');
      }
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const send = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('[v0] WebSocket not connected');
    }
  }, []);

  return { data, status, error, send };
};
