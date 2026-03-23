import { useEffect, useRef } from 'react';
import { FullWalletData } from '../lib/goldrush';

const TYPES = {
  GAS_GOBLIN: {
    label: 'GAS GOBLIN',
    desc: 'Has paid more in gas than most people earn in a month. The validators thank you personally.',
    color: '#FF8C00',
  },
  NFT_ARCHAEOLOGIST: {
    label: 'NFT ARCHAEOLOGIST',
    desc: 'Collects digital artifacts across every chain like a modern Indiana Jones with worse judgment.',
    color: '#a855f7',
  },
  CHAIN_HOPPER: {
    label: 'CHAIN HOPPER',
    desc: "Never stays on one chain long enough to form an opinion. FOMO as a personality.",
    color: '#00D4FF',
  },
  DEFI_SURGEON: {
    label: 'DEFI SURGEON',
    desc: 'Precise. Clinical. Has interacted with more protocols than most people know exist.',
    color: '#00E87A',
  },
  MEMECOIN_MISSIONARY: {
    label: 'MEMECOIN MISSIONARY',
    desc: 'Spreading the gospel of tokens with no utility and pure vibes. The market is unconvinced.',
    color: '#FF4C8B',
  },
  SILENT_ACCUMULATOR: {
    label: 'SILENT ACCUMULATOR',
    desc: 'Few transactions. Large positions. Watching. Waiting. Probably fine.',
    color: '#FFB800',
  },
  DIAMOND_HANDS: {
    label: 'DIAMOND HANDS',
    desc: 'Buys and never sells. Either genius or delusional. The chain cannot tell which.',
    color: '#00D4FF',
  },
  LOST_TOURIST: {
    label: 'LOST TOURIST',
    desc: 'Arrived in crypto, looked around, made one transaction, and has not been heard from since.',
    color: '#6B7280',
  },
};

export type PersonalityType = keyof typeof TYPES;

export function classify(data: FullWalletData): PersonalityType {
  if (data.gasSpentUSD > 2000) return 'GAS_GOBLIN';
  if (data.nftCount > 30 && data.activeChains.length >= 3) return 'NFT_ARCHAEOLOGIST';
  if (data.activeChains.length >= 5) return 'CHAIN_HOPPER';
  if (data.uniqueTokenCount >= 8) return 'DEFI_SURGEON';
  if (data.hasMemecoin && data.txnCount > 20) return 'MEMECOIN_MISSIONARY';
  if (data.txnCount < 50 && data.portfolioUSD > 10000) return 'SILENT_ACCUMULATOR';
  if (data.txnCount > 50 && data.portfolioUSD > data.txnCount * 10) return 'DIAMOND_HANDS';
  return 'LOST_TOURIST';
}

const SCALE = 4; // 15x15 grid → 60x60

function drawIcon(ctx: CanvasRenderingContext2D, type: PersonalityType, color: string) {
  ctx.clearRect(0, 0, 60, 60);

  function dot(x: number, y: number) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
  }

  switch (type) {
    case 'GAS_GOBLIN': {
      // Flame shape
      [[6, 12],[7, 11],[7, 10],[6, 9],[7, 8],[8, 7],[9, 8],[8, 9],[9, 10],[8, 11],[9, 12],
       [7, 12],[8, 12],[6, 11],[5, 10],[5, 11]].forEach(([x, y]) => dot(x, y));
      break;
    }
    case 'CHAIN_HOPPER': {
      // Chain links
      [[3,6],[4,6],[5,6],[5,7],[5,8],[4,8],[3,8],[3,7],
       [7,6],[8,6],[9,6],[9,7],[9,8],[8,8],[7,8],[7,7],
       [5,7],[6,7],[7,7]].forEach(([x, y]) => dot(x, y));
      break;
    }
    case 'DEFI_SURGEON': {
      // Plus/cross
      [[6,4],[7,4],[7,5],[7,6],[8,6],[9,6],[10,6],[10,7],[10,8],[9,8],[8,8],
       [8,9],[8,10],[7,10],[7,9],[6,8],[5,8],[4,8],[4,7],[4,6],[5,6],[6,6],
       [7,7],[7,8],[8,7]].forEach(([x, y]) => dot(x, y));
      break;
    }
    case 'MEMECOIN_MISSIONARY': {
      // Circle/coin
      [[6,3],[7,3],[8,3],[5,4],[9,4],[4,5],[10,5],[4,6],[10,6],[4,7],[10,7],
       [5,8],[9,8],[6,9],[7,9],[8,9],[7,5],[7,6],[7,7]].forEach(([x, y]) => dot(x, y));
      break;
    }
    case 'SILENT_ACCUMULATOR': {
      // Vault/lock shape
      [[5,5],[6,5],[7,5],[8,5],[9,5],[5,6],[9,6],[5,7],[9,7],[4,8],[10,8],
       [4,9],[10,9],[4,10],[10,10],[4,11],[10,11],[4,12],[5,12],[6,12],
       [7,12],[8,12],[9,12],[10,12],[7,9],[7,10]].forEach(([x, y]) => dot(x, y));
      break;
    }
    case 'NFT_ARCHAEOLOGIST': {
      // Shovel
      [[7,2],[8,2],[7,3],[8,3],[7,4],[8,4],[7,5],[8,5],[7,6],[8,6],
       [7,7],[8,7],[7,8],[8,8],[6,9],[9,9],[5,10],[10,10],[6,11],[9,11],
       [7,12],[8,12]].forEach(([x, y]) => dot(x, y));
      break;
    }
    case 'DIAMOND_HANDS': {
      // Diamond
      [[7,3],[6,4],[8,4],[5,5],[7,5],[9,5],[4,6],[8,6],[10,6],
       [5,7],[9,7],[6,8],[8,8],[7,9],[7,10]].forEach(([x, y]) => dot(x, y));
      break;
    }
    case 'LOST_TOURIST':
    default: {
      // Question mark
      [[6,3],[7,3],[8,3],[5,4],[9,4],[9,5],[8,6],[7,6],[7,7],[7,8],
       [7,10],[7,11]].forEach(([x, y]) => dot(x, y));
      break;
    }
  }
}

type Props = {
  data: FullWalletData;
};

export function PersonalityCard({ data }: Props) {
  const type = classify(data);
  const info = TYPES[type];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    drawIcon(ctx, type, info.color);
  }, [type, info.color]);

  return (
    <div className="px-card p-6 space-y-4">
      <p className="font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.12em' }}>
        PERSONALITY TYPE
      </p>
      <div className="flex items-start gap-4">
        <canvas
          ref={canvasRef}
          width={60}
          height={60}
          style={{ imageRendering: 'pixelated', flexShrink: 0 }}
        />
        <div className="space-y-2">
          <p className="font-pixel" style={{ fontSize: '10px', color: info.color, letterSpacing: '0.04em', lineHeight: 1.8 }}>
            {info.label}
          </p>
          <p style={{ fontSize: '14px', color: '#C8C8C8', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7 }}>
            {info.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
