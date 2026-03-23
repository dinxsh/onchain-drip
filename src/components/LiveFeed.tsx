import { useState, useEffect, useRef } from 'react';
import { subscribeWalletActivity, LiveEvent, StreamStatus } from '../lib/streaming';

const CREDITS: Record<string, number> = {
  'Token Balances': 5,
  'NFTs': 5,
  'Transactions': 5,
  'Active Chains': 1,
  'Security Approvals': 5,
  'Portfolio History': 5,
};

type ApiCall = {
  name: string;
  endpoint: string;
  status: 'waiting' | 'loading' | 'success' | 'error';
  statusCode?: number;
};

type Props = {
  apiCalls: ApiCall[];
  address: string;
};

function statusColor(status: ApiCall['status']): string {
  if (status === 'success') return '#00E87A';
  if (status === 'error') return '#F85149';
  if (status === 'loading') return '#FFB800';
  return '#2A2A2A';
}

function statusLabel(status: ApiCall['status']): string {
  if (status === 'success') return 'OK';
  if (status === 'error') return 'ERR';
  if (status === 'loading') return '...';
  return 'WAIT';
}

function secondsAgo(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000);
  return `${s}s`;
}

export function LiveFeed({ apiCalls, address }: Props) {
  const [tab, setTab] = useState<'history' | 'live'>('history');
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('idle');
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [, setTick] = useState(0);
  const unsubRef = useRef<(() => void) | null>(null);

  // Tick every second to update "Xs ago"
  useEffect(() => {
    if (tab !== 'live') return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [tab]);

  function handleConnect() {
    if (streamStatus === 'connected' || streamStatus === 'connecting') return;
    const apiKey = import.meta.env.VITE_GOLDRUSH_API_KEY ?? '';
    unsubRef.current = subscribeWalletActivity(
      address,
      apiKey,
      (event) => {
        setEvents(prev => [event, ...prev].slice(0, 10));
      },
      (status) => setStreamStatus(status)
    );
  }

  function handleDisconnect() {
    unsubRef.current?.();
    unsubRef.current = null;
    setStreamStatus('idle');
    setEvents([]);
  }

  useEffect(() => {
    return () => { unsubRef.current?.(); };
  }, []);

  const totalCredits = apiCalls.reduce((sum, c) => sum + (CREDITS[c.name] ?? 0), 0);

  return (
    <div className="px-card space-y-0">
      {/* Tab bar */}
      <div className="flex" style={{ borderBottom: '1px solid #1C1C1C' }}>
        {(['history', 'live'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-pixel btn-press px-5 py-3 ${tab === t ? 'tab-active' : 'tab-inactive'}`}
            style={{ fontSize: '7px', letterSpacing: '0.1em', background: 'transparent', border: 'none' }}
          >
            {t === 'history' ? 'API HISTORY' : 'LIVE FEED'}
          </button>
        ))}
      </div>

      {/* History tab */}
      {tab === 'history' && (
        <div className="p-5 space-y-3">
          <div style={{ border: '1px solid #1C1C1C' }}>
            {apiCalls.map((call, i) => (
              <div
                key={call.name}
                className="flex items-center justify-between px-4 py-2.5 gap-4"
                style={{
                  background: '#080808',
                  borderBottom: i < apiCalls.length - 1 ? '1px solid #111' : 'none',
                }}
              >
                <span className="font-pixel" style={{ fontSize: '6px', color: '#404040', flex: 1 }}>
                  {call.name}
                </span>
                <span className="font-data" style={{ fontSize: '11px', color: '#2A2A2A' }}>
                  {call.endpoint}
                </span>
                <span className="font-pixel" style={{ fontSize: '6px', color: '#2A2A2A' }}>
                  {CREDITS[call.name] ?? 0} CU
                </span>
                {call.statusCode && (
                  <span className="font-data" style={{ fontSize: '11px', color: '#2A2A2A' }}>
                    {call.statusCode}
                  </span>
                )}
                <span
                  className="px-tag"
                  style={{
                    fontSize: '5px',
                    color: statusColor(call.status),
                    borderColor: statusColor(call.status) + '50',
                    background: statusColor(call.status) + '10',
                  }}
                >
                  {statusLabel(call.status)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <p className="font-pixel" style={{ fontSize: '6px', color: '#2A2A2A', letterSpacing: '0.1em' }}>
              TOTAL COMPUTE UNITS
            </p>
            <p className="font-data" style={{ fontSize: '14px', color: '#484848' }}>
              {totalCredits} CU
            </p>
          </div>
        </div>
      )}

      {/* Live tab */}
      {tab === 'live' && (
        <div className="p-5 space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-4">
            {streamStatus === 'idle' || streamStatus === 'unavailable' ? (
              <button
                onClick={handleConnect}
                className="btn-press font-pixel"
                style={{
                  fontSize: '7px',
                  padding: '8px 16px',
                  color: '#00E87A',
                  border: '1px solid #00E87A40',
                  background: 'transparent',
                  letterSpacing: '0.08em',
                }}
              >
                CONNECT
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="btn-press font-pixel"
                style={{
                  fontSize: '7px',
                  padding: '8px 16px',
                  color: '#F85149',
                  border: '1px solid #F8514940',
                  background: 'transparent',
                  letterSpacing: '0.08em',
                }}
              >
                DISCONNECT
              </button>
            )}

            {streamStatus === 'connected' && (
              <div className="flex items-center gap-2">
                <span className="live-dot" />
                <span className="font-pixel" style={{ fontSize: '6px', color: '#00E87A' }}>LIVE</span>
              </div>
            )}
            {streamStatus === 'connecting' && (
              <span className="font-pixel" style={{ fontSize: '6px', color: '#FFB800' }}>CONNECTING...</span>
            )}
            {streamStatus === 'unavailable' && (
              <span className="font-pixel" style={{ fontSize: '6px', color: '#484848' }}>STREAMING UNAVAILABLE</span>
            )}
          </div>

          {/* Events */}
          {streamStatus === 'idle' && (
            <p className="font-pixel" style={{ fontSize: '6px', color: '#2A2A2A' }}>
              Click CONNECT to start streaming
            </p>
          )}

          {events.length === 0 && streamStatus === 'connected' && (
            <p className="font-pixel" style={{ fontSize: '6px', color: '#2A2A2A' }}>
              Waiting for activity...
            </p>
          )}

          <div className="space-y-1">
            {events.map(ev => (
              <div
                key={ev.id}
                className="slide-in flex items-center gap-3 px-3 py-2"
                style={{ background: '#080808', border: '1px solid #111' }}
              >
                <span className="px-tag" style={{ fontSize: '5px', color: '#00D4FF', borderColor: '#00D4FF30', background: '#00D4FF08' }}>
                  {ev.chain.toUpperCase().replace('-MAINNET', '')}
                </span>
                <span className="px-tag" style={{ fontSize: '5px', color: '#484848', borderColor: '#48484830', background: 'transparent' }}>
                  {ev.type.toUpperCase()}
                </span>
                <span className="font-data flex-1" style={{ fontSize: '12px', color: '#484848' }}>
                  {ev.valueUSD > 0 ? `$${ev.valueUSD.toFixed(2)}` : 'N/A'}
                </span>
                <span className="font-data" style={{ fontSize: '11px', color: '#2A2A2A' }}>
                  {secondsAgo(ev.timeMs)}s ago
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
