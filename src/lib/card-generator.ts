import { CharacterTraits, drawCharacter } from './character';
import { TIER_COLOR } from './score';

export type CardData = {
  address: string;
  dripScore: number;
  tier: string;
  portfolioUSD: number;
  txnCount: number;
  chainCount: number;
  nftCount: number;
  personalityLabel: string;
  roastVerdict: string;
  activeChains: string[];
  radarValues: number[]; // 6 values: activity, diversify, nftGame, chainReach, longevity, security
  traits: CharacterTraits;
};

export function generateCard(canvas: HTMLCanvasElement, data: CardData): void {
  const W = 1200,
    H = 630;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // Background
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,76,139,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Draw pixel character (left section)
  const charCanvas = document.createElement('canvas');
  charCanvas.width = 120;
  charCanvas.height = 200;
  const charCtx = charCanvas.getContext('2d')!;
  charCtx.imageSmoothingEnabled = false;
  drawCharacter(charCtx, data.traits);
  ctx.drawImage(charCanvas, 50, 180, 180, 300);

  // Title
  ctx.font = "bold 18px 'Press Start 2P', monospace";
  ctx.fillStyle = '#FF4C8B';
  ctx.fillText('ROAST MY WALLET', 50, 60);

  // Address
  ctx.font = "14px 'Share Tech Mono', monospace";
  ctx.fillStyle = '#484848';
  ctx.fillText(`${data.address.slice(0, 10)}...${data.address.slice(-8)}`, 50, 90);

  // Score (center)
  const tierColor = (TIER_COLOR as Record<string, string>)[data.tier] ?? '#FF4C8B';
  ctx.font = "bold 96px 'Press Start 2P', monospace";
  ctx.fillStyle = tierColor;
  ctx.fillText(data.dripScore.toString(), 420, 280);

  ctx.font = "12px 'Press Start 2P', monospace";
  ctx.fillStyle = '#404040';
  ctx.fillText('DRIP SCORE', 420, 310);

  ctx.font = "10px 'Press Start 2P', monospace";
  ctx.fillStyle = tierColor;
  ctx.fillText(data.tier.toUpperCase(), 420, 340);

  // Stats row
  const stats = [
    {
      label: 'PORTFOLIO',
      value:
        data.portfolioUSD >= 1000
          ? `$${(data.portfolioUSD / 1000).toFixed(1)}K`
          : `$${data.portfolioUSD.toFixed(0)}`,
    },
    { label: 'TXN', value: data.txnCount.toLocaleString() },
    { label: 'CHAINS', value: data.chainCount.toString() },
    { label: 'NFTS', value: data.nftCount.toString() },
  ];
  stats.forEach((s, i) => {
    const x = 420 + i * 130;
    ctx.font = "9px 'Press Start 2P', monospace";
    ctx.fillStyle = '#404040';
    ctx.fillText(s.label, x, 390);
    ctx.font = "16px 'Share Tech Mono', monospace";
    ctx.fillStyle = '#E8E8E8';
    ctx.fillText(s.value, x, 415);
  });

  // Personality type
  ctx.font = "10px 'Press Start 2P', monospace";
  ctx.fillStyle = '#FF4C8B';
  ctx.fillText(data.personalityLabel, 420, 460);

  // Radar chart (right section)
  drawRadarOnCard(ctx, 920, 250, 150, data.radarValues, tierColor);

  // Roast verdict
  const verdict =
    data.roastVerdict.length > 90 ? data.roastVerdict.slice(0, 87) + '...' : data.roastVerdict;
  ctx.font = "13px 'Share Tech Mono', monospace";
  ctx.fillStyle = '#484848';
  ctx.fillText(`"${verdict}"`, 50, 560);

  // Bottom attribution
  ctx.font = "9px 'Press Start 2P', monospace";
  ctx.fillStyle = '#2A2A2A';
  ctx.fillText('POWERED BY GOLDRUSH.DEV', W - 320, H - 30);

  // Bottom border line
  ctx.strokeStyle = '#1C1C1C';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, H - 50);
  ctx.lineTo(W, H - 50);
  ctx.stroke();
}

function drawRadarOnCard(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  values: number[],
  color: string
) {
  const n = 6;
  const labels = ['ACTIVITY', 'DIVERSIFY', 'NFT', 'CHAINS', 'LONGEVITY', 'SECURITY'];
  const angleStep = (Math.PI * 2) / n;
  const startAngle = -Math.PI / 2;

  // Grid hexagons
  [0.25, 0.5, 0.75, 1.0].forEach((scale) => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      const x = cx + Math.cos(angle) * radius * scale;
      const y = cy + Math.sin(angle) * radius * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Data polygon
  ctx.beginPath();
  values.forEach((v, i) => {
    const angle = startAngle + i * angleStep;
    const r = (Math.min(v, 100) / 100) * radius;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = color + '20';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Labels
  ctx.font = "7px 'Press Start 2P', monospace";
  ctx.fillStyle = '#484848';
  ctx.textAlign = 'center';
  labels.forEach((label, i) => {
    const angle = startAngle + i * angleStep;
    const x = cx + Math.cos(angle) * (radius + 22);
    const y = cy + Math.sin(angle) * (radius + 22) + 4;
    ctx.fillText(label, x, y);
  });
  ctx.textAlign = 'left';
}
