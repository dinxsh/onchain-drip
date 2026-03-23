import { Tier, TIER_COLOR } from '../lib/score';

type Props = {
  portfolioUSD: number;
  nftCount: number;
  txnCount: number;
  activeChains: string[];
  tier: Tier;
  errors: string[];
};

function formatUSD(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000)     return `$${(val / 1_000).toFixed(1)}K`;
  if (val > 0)          return `$${val.toFixed(2)}`;
  return '$0';
}

const CHAIN_META: Record<string, { label: string; color: string }> = {
  'eth-mainnet':        { label: 'Ethereum',   color: '#627EEA' },
  'matic-mainnet':      { label: 'Polygon',    color: '#8B5CF6' },
  'bsc-mainnet':        { label: 'BNB Chain',  color: '#F7931A' },
  'avalanche-mainnet':  { label: 'Avalanche',  color: '#E84142' },
  'optimism-mainnet':   { label: 'Optimism',   color: '#FF4820' },
  'arbitrum-mainnet':   { label: 'Arbitrum',   color: '#1AABDB' },
  'base-mainnet':       { label: 'Base',       color: '#0052FF' },
  'fantom-mainnet':     { label: 'Fantom',     color: '#1969FF' },
  'scroll-mainnet':     { label: 'Scroll',     color: '#FFCC00' },
  'berachain-mainnet':  { label: 'Berachain',  color: '#FF8C00' },
  'linea-mainnet':      { label: 'Linea',      color: '#61DFFF' },
  'zksync-mainnet':     { label: 'zkSync',     color: '#4E529A' },
  'mantle-mainnet':     { label: 'Mantle',     color: '#38B2AC' },
};

export function TraitPanel({ portfolioUSD, nftCount, txnCount, activeChains, tier, errors }: Props) {
  const tierColor       = TIER_COLOR[tier];
  const portfolioUnavail = errors.includes('balance unavailable');

  const stats = [
    { label: 'PORTFOLIO',     value: portfolioUnavail ? 'UNAVAIL' : formatUSD(portfolioUSD), color: '#00E87A' },
    { label: 'NFTS HELD',     value: nftCount.toLocaleString(),                               color: '#a855f7' },
    { label: 'TRANSACTIONS',  value: txnCount.toLocaleString(),                               color: '#FF8C00' },
    { label: 'ACTIVE CHAINS', value: activeChains.length.toString(),                          color: '#00D4FF' },
  ];

  return (
    <div className="space-y-4">
      {/* 2×2 stat grid */}
      <div className="grid grid-cols-2 gap-px" style={{ background: '#1C1C1C' }}>
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="px-5 py-4 space-y-2"
            style={{
              background: '#0D0D0D',
              borderLeft: i % 2 === 0 ? `2px solid ${s.color}` : 'none',
            }}
          >
            <p className="font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.1em' }}>
              {s.label}
            </p>
            <p
              className="font-data"
              style={{
                fontSize: '22px',
                color: portfolioUnavail && s.label === 'PORTFOLIO' ? '#2A2A2A' : s.color,
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Active chains */}
      {activeChains.length > 0 && (
        <div className="space-y-2">
          <p className="font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.1em' }}>
            ACTIVE CHAINS
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeChains.map(chain => {
              const meta = CHAIN_META[chain] ?? {
                label: chain.replace('-mainnet', '').replace(/-/g, ' ').toUpperCase(),
                color: '#6B7280',
              };
              return (
                <span
                  key={chain}
                  className="font-pixel"
                  style={{
                    fontSize: '7px',
                    color: meta.color,
                    background: meta.color + '15',
                    border: `1px solid ${meta.color}50`,
                    padding: '4px 8px',
                    letterSpacing: '0.08em',
                  }}
                >
                  {meta.label.toUpperCase()}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Tier separator */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: '#1C1C1C' }} />
        <span
          className="px-tag"
          style={{ color: tierColor, borderColor: tierColor + '50', background: tierColor + '10' }}
        >
          {tier.toUpperCase()} TIER
        </span>
        <div className="h-px flex-1" style={{ background: '#1C1C1C' }} />
      </div>
    </div>
  );
}
