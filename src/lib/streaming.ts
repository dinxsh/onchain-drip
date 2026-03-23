export type LiveEvent = {
  id: string;
  chain: string;
  type: 'transfer' | 'swap' | 'mint' | 'approval' | 'unknown';
  valueUSD: number;
  timeMs: number;
  hash?: string;
};

export type StreamStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'unavailable';

export function subscribeWalletActivity(
  address: string,
  apiKey: string,
  onEvent: (e: LiveEvent) => void,
  onStatus: (s: StreamStatus) => void
): () => void {
  let ws: WebSocket | null = null;
  let disposed = false;
  onStatus('connecting');

  const connectTimeout = setTimeout(() => {
    if (!disposed && ws?.readyState !== WebSocket.OPEN) {
      ws?.close();
      onStatus('unavailable');
    }
  }, 5000);

  try {
    ws = new WebSocket('wss://streaming.covalenthq.com/v1/subscribe');
    ws.onopen = () => {
      clearTimeout(connectTimeout);
      onStatus('connected');
      ws!.send(
        JSON.stringify({
          type: 'subscribe',
          topic: 'wallet_activity',
          address,
          api_key: apiKey,
        })
      );
    };
    ws.onmessage = (msg) => {
      try {
        const d = JSON.parse(msg.data);
        onEvent({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
          chain: d.chain_name ?? d.chain ?? 'unknown',
          type: (d.event_type ?? d.type ?? 'unknown') as LiveEvent['type'],
          valueUSD: d.value_quote ?? d.value ?? 0,
          timeMs: Date.now(),
          hash: d.tx_hash,
        });
      } catch {
        // ignore parse errors
      }
    };
    ws.onerror = () => {
      clearTimeout(connectTimeout);
      if (!disposed) onStatus('unavailable');
    };
    ws.onclose = () => {
      clearTimeout(connectTimeout);
      if (!disposed) onStatus('unavailable');
    };
  } catch {
    clearTimeout(connectTimeout);
    onStatus('unavailable');
  }

  return () => {
    disposed = true;
    clearTimeout(connectTimeout);
    ws?.close();
  };
}
