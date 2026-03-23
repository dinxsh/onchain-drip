import { Tier, TIER_COLOR } from '../lib/score';
import { generateRoast as generateRoastFromEngine, RoastContext } from '../lib/roast-engine';

export type Props = {
  address: string;
  portfolioUSD: number;
  nftCount: number;
  txnCount: number;
  activeChains: string[];
  tier: Tier;
  score: number;
  errors: string[];
  // Extended context for richer roasts (optional, falls back to basic)
  walletAgeDays?: number;
  portfolioDelta7d?: number;
  unlimitedApprovals?: number;
  highRiskApprovals?: number;
  topTokenSymbols?: string[];
  hasMemecoin?: boolean;
  largestTxnUSD?: number;
  gasSpentUSD?: number;
  securityScore?: number;
};

type Label = { text: string; color: string };
type RoastResult = { headline: string; body: string; verdict: string };

// ─── Format helpers ─────────────────────────────────────────────

export function formatUSD(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000)     return `$${(val / 1_000).toFixed(1)}K`;
  if (val > 0)          return `$${val.toFixed(2)}`;
  return '$0';
}

function chainNames(chains: string[]): string {
  const map: Record<string, string> = {
    'eth-mainnet':        'Ethereum',
    'matic-mainnet':      'Polygon',
    'bsc-mainnet':        'BNB Chain',
    'avalanche-mainnet':  'Avalanche',
    'optimism-mainnet':   'Optimism',
    'arbitrum-mainnet':   'Arbitrum',
    'base-mainnet':       'Base',
    'fantom-mainnet':     'Fantom',
    'scroll-mainnet':     'Scroll',
    'berachain-mainnet':  'Berachain',
    'linea-mainnet':      'Linea',
    'zksync-mainnet':     'zkSync',
    'mantle-mainnet':     'Mantle',
  };
  const named = chains.slice(0, 4).map(c => map[c] ?? c.replace('-mainnet', ''));
  const rest  = chains.length > 4 ? ` and ${chains.length - 4} more` : '';
  return named.join(', ') + rest;
}

// ─── Activity labels ─────────────────────────────────────────────

export function getActivityLabels(
  portfolioUSD: number,
  nftCount: number,
  txnCount: number,
  chainCount: number,
  score: number
): Label[] {
  const out: Label[] = [];

  if (portfolioUSD > 100_000) out.push({ text: 'WHALE WALLET',    color: '#FFB800' });
  else if (portfolioUSD > 10_000) out.push({ text: 'HEAVY BAG',   color: '#FF8C00' });
  else if (portfolioUSD > 1_000)  out.push({ text: 'MID BAG',     color: '#00E87A' });
  else if (portfolioUSD > 0)      out.push({ text: 'LIGHT BAG',   color: '#00D4FF' });
  else                            out.push({ text: 'EMPTY POCKETS', color: '#404040' });

  if (txnCount > 2_000)      out.push({ text: 'SERIAL TRADER',    color: '#FF4C8B' });
  else if (txnCount > 500)   out.push({ text: 'ACTIVE TRADER',    color: '#FF8C00' });
  else if (txnCount > 50)    out.push({ text: 'OCCASIONAL',       color: '#00D4FF' });
  else if (txnCount > 0)     out.push({ text: 'LURKER',           color: '#6B7280' });
  else                       out.push({ text: 'GHOST',            color: '#2A2A2A' });

  if (nftCount > 100)      out.push({ text: 'NFT WHALE',        color: '#FF4C8B' });
  else if (nftCount > 20)  out.push({ text: 'NFT COLLECTOR',    color: '#a855f7' });
  else if (nftCount > 0)   out.push({ text: 'NFT CURIOUS',      color: '#818cf8' });

  if (chainCount >= 6)     out.push({ text: 'MULTICHAIN MAXI',  color: '#00D4FF' });
  else if (chainCount >= 3) out.push({ text: 'CHAIN HOPPER',    color: '#00E87A' });

  if (portfolioUSD > 50_000 && txnCount < 20)
    out.push({ text: 'DIAMOND HANDS', color: '#00D4FF' });
  if (txnCount > 500 && portfolioUSD < 200)
    out.push({ text: 'FULL DEGEN',    color: '#FF4C8B' });
  if (score <= 15 && txnCount > 0)
    out.push({ text: 'REKT',          color: '#6B7280' });

  return out.slice(0, 5);
}

// ─── Roast engine ────────────────────────────────────────────────
// Detects contradictions first, then falls back to tier-based roasts.
// Uses exact numbers, chain names, and combo-specific angles.

export function generateRoast(
  portfolioUSD: number,
  nftCount: number,
  txnCount: number,
  chainCount: number,
  activeChains: string[],
  tier: Tier,
  score: number
): RoastResult {

  const usd   = formatUSD(portfolioUSD);
  const txns  = txnCount.toLocaleString();
  const named = chainNames(activeChains);
  const addr  = `this wallet`;

  // ── CONTRADICTION: many chains, zero or near-zero substance ───
  if (chainCount >= 4 && txnCount === 0) return {
    headline: `${chainCount} Chains. Zero Moves.`,
    body:
      `${addr} has an address on ${named} — and has never executed a single transaction on any of them. ` +
      `${portfolioUSD > 1 ? `There is ${usd} sitting untouched somewhere in there. ` : ''}` +
      `This is airdrop farming archaeology: the wallet that spread itself across every chain during incentive season, ` +
      `collected dust, and then stopped existing.`,
    verdict:
      `${chainCount} chains have your address on file. None of them have heard from you since.`,
  };

  if (chainCount >= 4 && txnCount < 10 && portfolioUSD < 100) return {
    headline: `Multichain Ghost`,
    body:
      `Active on ${named}. Total holdings: ${usd}. Total transactions: ${txns}. ` +
      `You bridged to every chain that was trending in 2023, made ${txns === '0' ? 'no trades' : `${txns} trade${txnCount > 1 ? 's' : ''}`}, ` +
      `and left. ${chainCount} chains, one conclusion: ` +
      `the only thing distributed here was disappointment.`,
    verdict:
      `The chains remember you. Barely.`,
  };

  // ── CONTRADICTION: high txn count, tiny portfolio ─────────────
  if (txnCount > 500 && portfolioUSD < 500) return {
    headline: `${txns} Transactions. Still Broke.`,
    body:
      `${txns} on-chain transactions and ${usd} to show for it. ` +
      `Every time the market moved, you moved with it — consistently in the wrong direction. ` +
      `The gas fees on this wallet have contributed more to validator income than the actual trading has contributed to yours. ` +
      `${chainCount > 1 ? `Spread across ${chainCount} chains, somehow equally unremarkable on all of them.` : ''}`,
    verdict:
      `Volume without direction is just expensive noise.`,
  };

  if (txnCount > 200 && portfolioUSD < 100) return {
    headline: `Busy Going Nowhere`,
    body:
      `${txns} transactions. ${usd} remaining. ` +
      `You've been active — nobody can take that from you. ` +
      `What can be taken is the argument that any of it was profitable. ` +
      `${nftCount > 0 ? `The ${nftCount} NFT${nftCount > 1 ? 's' : ''} in here are probably not helping the thesis.` : 'At least you didn\'t buy NFTs.'}`,
    verdict:
      `Activity is not the same as progress. This wallet proves it.`,
  };

  // ── CONTRADICTION: many NFTs, near-zero liquid portfolio ───────
  if (nftCount > 10 && portfolioUSD < 500) return {
    headline: `${nftCount} JPEGs, ${usd} Left`,
    body:
      `You own ${nftCount} NFTs and have ${usd} in liquid assets. ` +
      `The math here is a one-way transaction history: money in, JPEGs out, portfolio value: unclear. ` +
      `${txnCount > 100 ? `${txns} transactions deep and the liquid side never recovered. ` : ''}` +
      `Somewhere between purchase ${Math.floor(nftCount * 0.3)} and purchase ${nftCount}, ` +
      `a different decision could have been made.`,
    verdict:
      `The NFT market is not coming back at the pace this wallet requires.`,
  };

  // ── CONTRADICTION: whale portfolio, minimal activity ──────────
  if (portfolioUSD > 50_000 && txnCount < 20) return {
    headline: `The Vault`,
    body:
      `${usd} in assets. ${txns} transaction${txnCount !== 1 ? 's' : ''}. ` +
      `This is either extraordinary discipline or someone who bought early, ` +
      `got scared, and refused to touch the keyboard ever again. ` +
      `${chainCount > 1 ? `Deployed across ${chainCount} chains with barely a fingerprint on any of them. ` : ''}` +
      `The ${usd} is real. The strategy, if there is one, is completely opaque.`,
    verdict:
      `Patient or paralyzed. From the outside, the chart looks the same.`,
  };

  // ── RUGGED (0–15) ─────────────────────────────────────────────
  if (tier === 'rugged') {
    if (txnCount === 0) return {
      headline: `The Ghost Wallet`,
      body:
        `Zero transactions. ${portfolioUSD > 0 ? `${usd} sitting in an address that has never sent or received anything intentional. ` : ''}` +
        `You set up a wallet, presumably had ambitions, ` +
        `and then contributed nothing to the blockchain whatsoever. ` +
        `This address exists the same way a gym membership exists — ` +
        `paid for, registered, never used.`,
      verdict:
        `Score: ${score}/100. You are the tutorial character that never left the intro screen.`,
    };
    if (portfolioUSD < 5) return {
      headline: `The Cautionary Tale`,
      body:
        `${txns} transactions. ${usd} remaining. ` +
        `You entered the market, made your moves, and this is the result. ` +
        `${chainCount > 1 ? `Across ${chainCount} chains, no less. ` : ''}` +
        `The blockchain has an immutable record of every decision that led here — ` +
        `which means future generations can study this wallet as a masterclass in what not to do.`,
      verdict:
        `The chain never forgets. Unfortunately.`,
    };
    return {
      headline: `Technically On-Chain`,
      body:
        `${usd} across ${txns} transaction${txnCount !== 1 ? 's' : ''} on ${chainCount} chain${chainCount > 1 ? 's' : ''}. ` +
        `You are on-chain the same way someone is "at the gym" ` +
        `when they're in the parking lot. ` +
        `Presence confirmed. Participation: inconclusive.`,
      verdict: `Still alive. Evidence is limited.`,
    };
  }

  // ── NORMIE (16–35) ────────────────────────────────────────────
  if (tier === 'normie') {
    if (chainCount >= 3 && txnCount < 30) return {
      headline: `Spreading Thin`,
      body:
        `${usd} distributed across ${named}. ` +
        `${txns} transactions to show for ${chainCount} chains of presence. ` +
        `Multichain activity looks impressive until you check the numbers. ` +
        `You've been everywhere and done very little in any of it.`,
      verdict: `Quantity of chains does not compound.`,
    };
    if (nftCount > 5 && portfolioUSD < 1_000) return {
      headline: `JPEG Broke`,
      body:
        `${nftCount} NFTs in the collection, ${usd} in everything else. ` +
        `The ratio here tells a complete story: you had liquidity, ` +
        `you saw some art, you made choices. ` +
        `${txns} transactions later, this is what the portfolio looks like. ` +
        `The market has re-evaluated your taste with extreme prejudice.`,
      verdict: `The floor dropped. The NFTs stayed. The money did not.`,
    };
    return {
      headline: `Chronically Average`,
      body:
        `${usd} in holdings. ${txns} transactions. ${chainCount} chain${chainCount > 1 ? 's' : ''}. ` +
        `You are exactly as on-chain as someone who discovered crypto via a trending post, ` +
        `bought something near the top, and has been waiting for a recovery ever since. ` +
        `Not rugged, not thriving — occupying the precise median of blockchain participation.`,
      verdict: `Participation confirmed. Distinction: none.`,
    };
  }

  // ── HOLDER (36–60) ────────────────────────────────────────────
  if (tier === 'holder') {
    if (chainCount >= 4 && txnCount < 30) return {
      headline: `${chainCount} Chains, Quiet Portfolio`,
      body:
        `You're deployed on ${named} with ${usd} in holdings and only ${txns} transactions. ` +
        `The chain count is doing most of the work here. ` +
        `${portfolioUSD > 1_000 ? `The ${usd} portfolio is real — but it\'s doing very little across ${chainCount} chains.` : `The activity exists. The depth does not yet.`} ` +
        `You have the footprint of someone who has been everywhere and committed to nothing.`,
      verdict: `Coverage without conviction is just tourism.`,
    };
    if (txnCount < 30 && portfolioUSD > 3_000) return {
      headline: `The Patient One`,
      body:
        `${usd} in holdings across ${txns} transactions. ` +
        `You buy. You hold. You resist the urge to do anything stupid. ` +
        `${nftCount > 0 ? `The ${nftCount} NFT${nftCount > 1 ? 's' : ''} represent one brief moment of weakness, but you recovered.` : 'No NFTs — the only rational decision in this portfolio.'} ` +
        `This is either genuine conviction or an inability to find the sell button. ` +
        `At ${score}/100, the outcome is the same.`,
      verdict: `Boring is a strategy. This one works.`,
    };
    return {
      headline: `Quietly Winning`,
      body:
        `${usd} built through ${txns} transactions across ${chainCount} chain${chainCount > 1 ? 's' : ''}. ` +
        `You've been in motion, you haven't destroyed yourself, ` +
        `and the portfolio reflects someone who understands the game well enough to still be playing it. ` +
        `${nftCount > 10 ? `The ${nftCount} NFTs suggest one period of enthusiasm. It passed.` : ''}`,
      verdict: `Above average. Verifiably. Don't get comfortable.`,
    };
  }

  // ── DEGEN (61–85) ─────────────────────────────────────────────
  if (tier === 'degen') {
    if (txnCount > 1_500) return {
      headline: `The Insomniac`,
      body:
        `${txns} transactions across ${chainCount} chain${chainCount > 1 ? 's' : ''}. ` +
        `You are not investing — you are speed-running financial anxiety. ` +
        `The ${usd} portfolio is what survived the velocity; ` +
        `the gas fees on this wallet have single-handedly funded at least two validator retirement plans. ` +
        `${nftCount > 0 ? `Plus ${nftCount} NFTs, because at this transaction count, filters stopped working.` : ''}`,
      verdict: `Statistically you should not be here. Yet here you are.`,
    };
    if (nftCount > 30) return {
      headline: `JPEG Maximalist`,
      body:
        `${nftCount} NFTs. ${usd} in portfolio. ${txns} transactions on-chain. ` +
        `There is a point at which NFT collecting stops being a hobby ` +
        `and becomes a load-bearing personality trait. ` +
        `You passed that point around piece number ${Math.floor(nftCount * 0.4)}. ` +
        `The ${usd} suggests some of it paid off. Most of it probably didn't.`,
      verdict: `High conviction. Unusual taste. Surprisingly intact.`,
    };
    if (chainCount >= 5) return {
      headline: `Perpetually Bridging`,
      body:
        `${chainCount} active chains: ${named}. ` +
        `${txns} transactions. ${usd} in assets. ` +
        `You have touched every chain that has ever offered an incentive and some that didn't. ` +
        `The cross-chain bridge fees on this wallet are their own line item. ` +
        `Somehow ${usd} remains — at this activity level, that is a genuine achievement.`,
      verdict: `Every chain, every protocol, every risk. Still alive.`,
    };
    return {
      headline: `Controlled Chaos`,
      body:
        `${usd} built through ${txns} transactions across ${chainCount} chain${chainCount > 1 ? 's' : ''}. ` +
        `You operate at a cadence that would give a compliance officer a physical reaction, ` +
        `yet the portfolio reflects someone who either knows what they're doing ` +
        `or has survived long enough to look like it.`,
      verdict: `High risk. High survival rate. Respect.`,
    };
  }

  // ── WHALE (86–100) ────────────────────────────────────────────
  if (txnCount > 3_000) return {
    headline: `The Unstoppable Force`,
    body:
      `${usd}. ${txns} transactions. ${chainCount} chains. ` +
      `You do not participate in markets — you are a market condition. ` +
      `At ${txns} transactions, you have personally funded the retirement plans of multiple validators. ` +
      `${nftCount > 50 ? `The ${nftCount} NFTs are the part where you stopped caring about returns and started caring about aesthetics.` : 'The portfolio speaks without needing an explanation.'}`,
    verdict: `This wallet is the reason gas fees are high.`,
  };
  if (nftCount > 100) return {
    headline: `Art Basel, On-Chain`,
    body:
      `${nftCount} NFTs. ${usd} in assets. ${txns} transactions across ${chainCount} chains. ` +
      `You have assembled a digital collection that most institutions would need a committee to approve. ` +
      `This wallet operates like a small fund with unusually strong opinions ` +
      `about the future of digital ownership.`,
    verdict: `Floor prices move when you move.`,
  };
  return {
    headline: `Silent Accumulator`,
    body:
      `${usd}. ${chainCount} chain${chainCount > 1 ? 's' : ''}. ${txns} transactions. ` +
      `${nftCount > 0 ? `${nftCount} NFTs. ` : ''}` +
      `Every number here is the result of a decision, and the decisions compound ` +
      `into something most wallets will never reach. ` +
      `This wallet didn't get here through luck. Or maybe it did — either way, it's here.`,
    verdict: `The chain has a long memory. This one has a good record.`,
  };
}

// ─── Tweet builder — viral X loop for GoldRush ──────────────────

export function buildTweetText(
  address: string,
  score: number,
  tier: Tier,
  portfolioUSD: number,
  nftCount: number,
  txnCount: number,
  chainCount: number,
  activeChains: string[]
): string {
  const roastCtx: RoastContext = {
    address,
    portfolioUSD,
    portfolioDelta7d: 0,
    nftCount,
    chainCount,
    activeChains,
    txnCount,
    walletAgeDays: 365,
    unlimitedApprovals: 0,
    highRiskApprovals: 0,
    topTokenSymbols: [],
    hasMemecoin: false,
    largestTxnUSD: 0,
    gasSpentUSD: 0,
    dripScore: score,
    tier,
    securityScore: 80,
  };
  const roast = generateRoastFromEngine(roastCtx);
  const labels   = getActivityLabels(portfolioUSD, nftCount, txnCount, chainCount, score);
  const labelStr = labels.slice(0, 3).map(l => l.text).join(' / ');
  const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return [
    `i let an AI roast my on-chain history`,
    ``,
    `verdict: "${roast.headline}"`,
    `"${roast.verdict}"`,
    ``,
    `score: ${score}/100 — ${tier.toUpperCase()}`,
    `${formatUSD(portfolioUSD)} | ${txnCount.toLocaleString()} txns | ${chainCount} chain${chainCount !== 1 ? 's' : ''} | ${nftCount} NFTs`,
    `${shortAddr}`,
    ``,
    `labels: ${labelStr}`,
    ``,
    `get yours roasted — powered by goldrush.dev`,
  ].join('\n');
}

// ─── Component ──────────────────────────────────────────────────

export function WalletSummary({
  address,
  portfolioUSD, nftCount, txnCount, activeChains, tier, score, errors,
  walletAgeDays = 365,
  portfolioDelta7d = 0,
  unlimitedApprovals = 0,
  highRiskApprovals = 0,
  topTokenSymbols = [],
  hasMemecoin = false,
  largestTxnUSD = 0,
  gasSpentUSD = 0,
  securityScore = 80,
}: Props) {
  const labels  = getActivityLabels(portfolioUSD, nftCount, txnCount, activeChains.length, score);

  // Build RoastContext and use roast-engine for richer output
  const roastCtx: RoastContext = {
    address: address ?? '0x0000000000000000000000000000000000000000',
    portfolioUSD,
    portfolioDelta7d,
    nftCount,
    chainCount: activeChains.length,
    activeChains,
    txnCount,
    walletAgeDays,
    unlimitedApprovals,
    highRiskApprovals,
    topTokenSymbols,
    hasMemecoin,
    largestTxnUSD,
    gasSpentUSD,
    dripScore: score,
    tier,
    securityScore,
  };
  const roast   = generateRoastFromEngine(roastCtx);
  const color   = TIER_COLOR[tier];

  return (
    <div className="space-y-5">

      {/* Roast block */}
      <div className="px-card p-6 space-y-4">
        {/* Headline row */}
        <div className="flex items-start justify-between gap-4">
          <h2
            className="font-pixel leading-loose"
            style={{ fontSize: '11px', color, letterSpacing: '0.04em', lineHeight: 1.8 }}
          >
            {roast.headline}
          </h2>
          <span
            className="px-tag shrink-0 mt-1"
            style={{ color, borderColor: color + '50', background: color + '12' }}
          >
            {tier.toUpperCase()}
          </span>
        </div>

        {/* Body */}
        <p
          style={{
            fontSize: '15px',
            lineHeight: 1.8,
            color: '#C8C8C8',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {roast.body}
        </p>

        {/* Divider */}
        <div style={{ height: '1px', background: '#1C1C1C' }} />

        {/* Verdict */}
        <p
          className="font-data"
          style={{ fontSize: '13px', color: '#484848', fontStyle: 'italic' }}
        >
          {roast.verdict}
        </p>
      </div>

      {/* Activity labels */}
      <div className="space-y-2.5">
        <p className="font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.12em' }}>
          ACTIVITY LABELS
        </p>
        <div className="flex flex-wrap gap-2">
          {labels.map(label => (
            <span
              key={label.text}
              className="px-tag"
              style={{ color: label.color, borderColor: label.color + '40', background: label.color + '0D' }}
            >
              {label.text}
            </span>
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <p className="font-data text-xs" style={{ color: '#FF8C00' }}>
          PARTIAL DATA — OUTFIT MAY BE INCOMPLETE
        </p>
      )}
    </div>
  );
}
