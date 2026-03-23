export type Tier = 'rugged' | 'normie' | 'holder' | 'degen' | 'whale';

export function calcDripScore(
  portfolioUSD: number,
  chains: number,
  txnCount: number,
  nftCount: number
): number {
  const portfolioPoints = Math.min(Math.log10(Math.max(portfolioUSD, 1)) * 15, 40);
  const chainPoints     = Math.min(chains * 6, 30);
  const txnPoints       = Math.min(Math.log10(Math.max(txnCount, 1)) * 10, 20);
  const nftPoints       = Math.min(nftCount * 0.15, 10);
  return Math.round(Math.min(portfolioPoints + chainPoints + txnPoints + nftPoints, 100));
}

export function getTier(score: number): Tier {
  if (score <= 15) return 'rugged';
  if (score <= 35) return 'normie';
  if (score <= 60) return 'holder';
  if (score <= 85) return 'degen';
  return 'whale';
}

export const TIER_COLOR: Record<Tier, string> = {
  rugged: '#6B7280',
  normie: '#00D4FF',
  holder: '#00E87A',
  degen:  '#FF8C00',
  whale:  '#FFB800',
};

export const TIER_LABEL: Record<Tier, string> = {
  rugged: 'RUGGED',
  normie: 'NORMIE',
  holder: 'HOLDER',
  degen:  'DEGEN',
  whale:  'WHALE',
};

// Keep legacy exports used by existing components
export const TIER_COLORS = TIER_COLOR;
export const TIER_LABELS = TIER_LABEL;
