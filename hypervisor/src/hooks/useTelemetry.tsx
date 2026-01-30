import { useState, useEffect } from 'react';
import type { TelemetryData } from '../types/telemetry';

export const useTelemetry = (url: string) => {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => setStatus('open');
    socket.onclose = () => setStatus('closed');
    
    socket.onmessage = (event) => {
      // Assuming your server sends JSON data
      const incomingData: TelemetryData = JSON.parse(event.data);
      setData(incomingData);
      setLastUpdatedAt(Date.now());
    };

    return () => socket.close();
  }, [url]);

  return { data, status, lastUpdatedAt };
};
