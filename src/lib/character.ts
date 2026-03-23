export type CharacterTraits = {
  tier: 'rugged' | 'normie' | 'holder' | 'degen' | 'whale';
  hasNFTs: boolean;
  chainCount: number;
  isWhale: boolean;
  isRugged: boolean;
  score: number;
};

const SCALE = 4;
const W = 30;
const H = 50;

export function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
}

function pxRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SCALE, y * SCALE, w * SCALE, h * SCALE);
}

const TIER_PALETTES = {
  rugged:  { body: '#4B5563', pants: '#374151', skin: '#9CA3AF', hat: '#6B7280', shoe: '#374151', accent: '#9CA3AF' },
  normie:  { body: '#3B82F6', pants: '#1D4ED8', skin: '#FBBF24', hat: '#1D4ED8', shoe: '#1E3A5F', accent: '#93C5FD' },
  holder:  { body: '#10B981', pants: '#065F46', skin: '#FBBF24', hat: '#059669', shoe: '#064E3B', accent: '#6EE7B7' },
  degen:   { body: '#F59E0B', pants: '#92400E', skin: '#FBBF24', hat: '#D97706', shoe: '#451A03', accent: '#FCD34D' },
  whale:   { body: '#FBBF24', pants: '#B45309', skin: '#FDE68A', hat: '#F59E0B', shoe: '#78350F', accent: '#FEF3C7' },
};

const CHAIN_COLORS = [
  '#627EEA', '#FF4820', '#1AABDB', '#8B5CF6',
  '#F7931A', '#00D395', '#E84142', '#0033AD',
];

export function drawCharacter(ctx: CanvasRenderingContext2D, traits: CharacterTraits) {
  ctx.clearRect(0, 0, W * SCALE, H * SCALE);

  const pal = TIER_PALETTES[traits.tier];
  const smiling = traits.score >= 60;

  // 1. Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(15 * SCALE, 48.5 * SCALE, 7 * SCALE, 1.5 * SCALE, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Cape (if chainCount >= 3) — behind body
  if (traits.chainCount >= 3) {
    const capeColors = CHAIN_COLORS.slice(0, Math.min(traits.chainCount, 8));
    const stripeW = Math.floor(10 / capeColors.length);
    capeColors.forEach((color, i) => {
      pxRect(ctx, 10 + i * stripeW, 16, stripeW, 18, color);
    });
    // Cape bottom triangle
    for (let row = 34; row < 42; row++) {
      const indent = row - 34;
      pxRect(ctx, 10 + indent, row, 10 - indent * 2 + 1, 1, capeColors[row % capeColors.length]);
    }
  }

  // 3. Hat
  if (!traits.isRugged) {
    // Hat brim
    pxRect(ctx, 9, 7, 12, 1, pal.hat);
    // Hat crown
    pxRect(ctx, 11, 4, 8, 3, pal.hat);
    if (traits.isWhale) {
      // Crown spikes
      px(ctx, 12, 3, pal.accent);
      px(ctx, 15, 2, pal.accent);
      px(ctx, 18, 3, pal.accent);
    }
  } else {
    // Rugged: sad droopy hat
    pxRect(ctx, 9, 7, 12, 1, pal.hat);
    pxRect(ctx, 12, 4, 6, 3, pal.hat);
    px(ctx, 12, 5, pal.accent);
  }

  // 4. Head
  pxRect(ctx, 10, 8, 10, 8, pal.skin);
  // Ears
  px(ctx, 9, 10, pal.skin);
  px(ctx, 20, 10, pal.skin);
  // Eyes
  px(ctx, 12, 10, traits.isRugged ? '#FF4444' : '#1F2937');
  px(ctx, 17, 10, traits.isRugged ? '#FF4444' : '#1F2937');
  // Eye shine
  if (!traits.isRugged) {
    px(ctx, 12, 9, '#FFFFFF');
    px(ctx, 17, 9, '#FFFFFF');
  }
  // Eyebrows — furrowed if rugged/low score
  if (traits.isRugged || !smiling) {
    px(ctx, 12, 9, '#4B3000');
    px(ctx, 13, 8, '#4B3000');
    px(ctx, 17, 9, '#4B3000');
    px(ctx, 16, 8, '#4B3000');
  } else {
    px(ctx, 12, 9, '#4B3000');
    px(ctx, 17, 9, '#4B3000');
  }
  // Mouth
  if (smiling) {
    px(ctx, 13, 13, '#1F2937');
    px(ctx, 14, 14, '#1F2937');
    px(ctx, 15, 14, '#1F2937');
    px(ctx, 16, 13, '#1F2937');
    // Teeth
    px(ctx, 14, 13, '#FFFFFF');
    px(ctx, 15, 13, '#FFFFFF');
  } else {
    px(ctx, 13, 14, '#1F2937');
    px(ctx, 14, 13, '#1F2937');
    px(ctx, 15, 13, '#1F2937');
    px(ctx, 16, 14, '#1F2937');
  }

  // 5. Neck
  pxRect(ctx, 13, 16, 4, 2, pal.skin);

  // 6. Body (or barrel if rugged)
  if (traits.isRugged) {
    // Barrel body
    pxRect(ctx, 9, 18, 12, 14, '#8B4513');
    // Barrel rings
    pxRect(ctx, 9, 19, 12, 1, '#6B3410');
    pxRect(ctx, 9, 24, 12, 1, '#6B3410');
    pxRect(ctx, 9, 29, 12, 1, '#6B3410');
    // Barrel slats
    for (let i = 0; i < 12; i += 2) {
      px(ctx, 9 + i, 20, '#A0522D');
    }
  } else {
    pxRect(ctx, 9, 18, 12, 12, pal.body);
    // Shirt details
    pxRect(ctx, 14, 18, 2, 4, pal.accent); // collar/tie
  }

  // 7. Arms + hands
  if (!traits.isRugged) {
    // Left arm
    pxRect(ctx, 6, 18, 3, 8, pal.body);
    pxRect(ctx, 6, 26, 3, 3, pal.skin); // left hand
    // Right arm
    pxRect(ctx, 21, 18, 3, 8, pal.body);
    if (traits.isWhale) {
      // Diamond in right hand
      pxRect(ctx, 21, 26, 3, 3, pal.skin);
      // Diamond shape
      px(ctx, 22, 28, '#A5F3FC');
      px(ctx, 21, 29, '#67E8F9');
      px(ctx, 22, 29, '#E0F2FE');
      px(ctx, 23, 29, '#67E8F9');
    } else {
      pxRect(ctx, 21, 26, 3, 3, pal.skin);
    }
  } else {
    // Rugged: tiny arms poking out
    pxRect(ctx, 6, 22, 3, 4, pal.skin);
    pxRect(ctx, 21, 22, 3, 4, pal.skin);
  }

  // 8. Belt
  pxRect(ctx, 9, 30, 12, 2, '#374151');
  if (traits.isWhale) {
    // Gold buckle
    pxRect(ctx, 13, 30, 4, 2, '#FBBF24');
    px(ctx, 14, 30, '#FEF3C7');
  } else {
    px(ctx, 14, 30, '#6B7280');
    px(ctx, 15, 30, '#6B7280');
  }

  // 9. Pants
  pxRect(ctx, 9, 32, 12, 6, pal.pants);

  // 10. Legs
  pxRect(ctx, 9, 38, 5, 7, pal.pants);
  pxRect(ctx, 16, 38, 5, 7, pal.pants);

  // 11. Shoes
  pxRect(ctx, 8, 44, 7, 3, pal.shoe);
  pxRect(ctx, 15, 44, 7, 3, pal.shoe);
  // Shoe tips
  px(ctx, 7, 45, pal.shoe);
  px(ctx, 22, 45, pal.shoe);

  // 12. Accessories
  // NFT medal (top-right shoulder)
  if (traits.hasNFTs) {
    pxRect(ctx, 21, 17, 4, 4, '#FBBF24');
    px(ctx, 22, 18, '#FEF3C7');
    px(ctx, 23, 18, '#FEF3C7');
    px(ctx, 22, 19, '#F59E0B');
    // Medal ribbon
    pxRect(ctx, 22, 15, 2, 2, '#EF4444');
  }
}

export function drawSkeleton(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, W * SCALE, H * SCALE);
  // Animated shimmer rectangle
  const gradient = ctx.createLinearGradient(0, 0, W * SCALE, 0);
  gradient.addColorStop(0, '#374151');
  gradient.addColorStop(0.5, '#4B5563');
  gradient.addColorStop(1, '#374151');
  ctx.fillStyle = gradient;
  // Head shape
  ctx.fillRect(10 * SCALE, 4 * SCALE, 10 * SCALE, 12 * SCALE);
  // Body shape
  ctx.fillRect(8 * SCALE, 17 * SCALE, 14 * SCALE, 20 * SCALE);
  // Leg shapes
  ctx.fillRect(8 * SCALE, 37 * SCALE, 6 * SCALE, 10 * SCALE);
  ctx.fillRect(16 * SCALE, 37 * SCALE, 6 * SCALE, 10 * SCALE);
}

export const CANVAS_WIDTH = W * SCALE;
export const CANVAS_HEIGHT = H * SCALE;
