import { useEffect, useRef, useState } from 'react';
import { Tier, TIER_COLOR, TIER_LABEL } from '../lib/score';

type Props = { score: number; tier: Tier; animate: boolean };

export function DripScore({ score, tier, animate }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const [flash, setFlash]         = useState(false);
  const raf = useRef<number>();
  const color = TIER_COLOR[tier];
  const label = TIER_LABEL[tier];

  useEffect(() => {
    if (!animate) { setDisplayed(score); return; }
    setDisplayed(0);
    const t0  = performance.now();
    const dur = 900;
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setDisplayed(Math.round(score * e));
      if (p < 1) { raf.current = requestAnimationFrame(step); }
      else { setFlash(true); setTimeout(() => setFlash(false), 350); }
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [score, animate]);

  return (
    <div className="text-center space-y-3 py-1">
      <p className="font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.15em' }}>
        DRIP SCORE
      </p>

      {/* Big score */}
      <div
        className={`font-pixel tabular-nums ${flash ? 'score-flash' : ''}`}
        style={{
          fontSize: '64px',
          lineHeight: 1,
          color,
          textShadow: `0 0 30px ${color}40`,
          letterSpacing: '-0.02em',
        }}
      >
        {displayed}
      </div>

      {/* Tier badge */}
      <div
        className="inline-block px-tag"
        style={{ color, borderColor: color + '50', background: color + '12', fontSize: '8px', letterSpacing: '0.14em' }}
      >
        {label}
      </div>

      {/* Progress bar */}
      <div className="relative h-1 overflow-hidden" style={{ background: '#1C1C1C' }}>
        <div
          className="h-full transition-all duration-500 relative overflow-hidden"
          style={{ width: `${displayed}%`, background: color }}
        >
          <div className="absolute inset-0 progress-shine" />
        </div>
      </div>

      <div className="flex justify-between font-pixel" style={{ fontSize: '6px', color: '#2A2A2A' }}>
        <span>0</span><span>50</span><span>100</span>
      </div>
    </div>
  );
}
