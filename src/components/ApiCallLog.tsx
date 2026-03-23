import { ApiCallState } from '../lib/goldrush';

type Props = {
  calls: ApiCallState[];
};

const STATUS_CONFIG = {
  waiting: {
    dot: '#334155',
    label: '■ IDLE',
    labelColor: '#475569',
    bg: 'transparent',
    border: '#1e293b',
  },
  loading: {
    dot: '#ffd700',
    label: '▶ FETCHING',
    labelColor: '#ffd700',
    bg: '#ffd70008',
    border: '#ffd70060',
  },
  success: {
    dot: '#00ff88',
    label: '✓ 200 OK',
    labelColor: '#00ff88',
    bg: '#00ff8808',
    border: '#00ff8860',
  },
  error: {
    dot: '#ff3344',
    label: '✕ ERROR',
    labelColor: '#ff3344',
    bg: '#ff334408',
    border: '#ff334460',
  },
};

const CALL_ICONS = ['◈', '◆', '◉', '◎'];

export function ApiCallLog({ calls }: Props) {
  return (
    <div className="relative" style={{ border: '1px solid #0d2a2a' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2"
        style={{ background: '#020c0c', borderBottom: '1px solid #0d2a2a' }}>
        <span className="font-pixel text-xs flicker" style={{ color: '#00ffe7', fontSize: '8px', letterSpacing: '0.1em' }}>
          ◈ GOLDRUSH API LOG
        </span>
        <span className="font-pixel text-xs pixel-blink" style={{ color: '#00ffe740', fontSize: '8px' }}>
          █
        </span>
      </div>

      {/* Rows */}
      <div style={{ background: '#030d0d' }}>
        {calls.map((call, i) => {
          const cfg = STATUS_CONFIG[call.status];
          const isActive = call.status === 'loading';
          return (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2.5 transition-all duration-300"
              style={{
                borderBottom: i < calls.length - 1 ? '1px solid #0d1f1f' : 'none',
                background: cfg.bg,
                borderLeft: `3px solid ${call.status === 'waiting' ? 'transparent' : cfg.border}`,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span style={{ color: cfg.dot, fontSize: '10px' }} className={isActive ? 'status-ping inline-block' : ''}>
                  {CALL_ICONS[i]}
                </span>
                <div className="min-w-0">
                  <div className="font-pixel text-white truncate" style={{ fontSize: '7px', letterSpacing: '0.08em' }}>
                    {call.name.toUpperCase()}
                  </div>
                  <div className="font-mono-tech truncate" style={{ fontSize: '10px', color: '#1d4040' }}>
                    {call.endpoint}
                  </div>
                </div>
              </div>
              <span
                className="font-pixel ml-2 shrink-0 px-2 py-0.5"
                style={{
                  fontSize: '7px',
                  color: cfg.labelColor,
                  border: `1px solid ${cfg.border}`,
                  background: cfg.bg,
                  letterSpacing: '0.05em',
                  textShadow: call.status !== 'waiting' ? `0 0 8px ${cfg.dot}` : 'none',
                }}
              >
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
