import { useEffect, useRef } from 'react';
import { CharacterTraits, drawCharacter, drawSkeleton, CANVAS_WIDTH, CANVAS_HEIGHT } from '../lib/character';
import { Tier, TIER_COLOR } from '../lib/score';

type Props = {
  traits: CharacterTraits | null;
  loading: boolean;
  tier?: Tier;
};

export function CharacterStage({ traits, loading, tier = 'normie' }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const glow = TIER_COLOR[traits?.tier ?? tier];

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    if (loading) { drawSkeleton(ctx); return; }
    drawCharacter(ctx, traits ?? {
      tier: 'normie', hasNFTs: false, chainCount: 1,
      isWhale: false, isRugged: false, score: 50,
    });
  }, [traits, loading]);

  return (
    <div className="relative flex flex-col items-center py-8 scanlines overflow-hidden"
      style={{ background: '#080808' }}>

      {/* Radial ambient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at 50% 60%, ${glow}0A 0%, transparent 60%)`,
      }} />

      {/* Subtle dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #FFFFFF06 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }} />

      {/* Character */}
      <div
        className={`relative z-10 ${loading ? '' : 'float'}`}
        style={{ filter: loading ? 'none' : `drop-shadow(0 0 8px ${glow}60)` }}
      >
        {loading && (
          <div className="absolute inset-0 shimmer" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }} />
        )}
        <canvas
          ref={ref}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            imageRendering: 'pixelated',
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            opacity: loading ? 0 : 1,
            transition: 'opacity 0.4s',
          }}
        />
      </div>

      {/* Ground line */}
      {!loading && (
        <div className="relative z-10 mt-1" style={{
          width: CANVAS_WIDTH * 0.6,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${glow}50, transparent)`,
        }} />
      )}
    </div>
  );
}
