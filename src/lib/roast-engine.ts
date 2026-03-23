export type RoastContext = {
  address: string;
  portfolioUSD: number;
  portfolioDelta7d: number;
  nftCount: number;
  chainCount: number;
  activeChains: string[];
  txnCount: number;
  walletAgeDays: number;
  unlimitedApprovals: number;
  highRiskApprovals: number;
  topTokenSymbols: string[];
  hasMemecoin: boolean;
  largestTxnUSD: number;
  gasSpentUSD: number;
  dripScore: number;
  tier: string;
  securityScore: number;
};

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[Math.abs(seed + offset) % arr.length];
}

function fmt(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`;
  if (usd > 0) return `$${usd.toFixed(2)}`;
  return '$0';
}

export function generateRoast(
  ctx: RoastContext
): { headline: string; body: string; verdict: string } {
  const seed = parseInt(ctx.address.slice(2, 10), 16) || 12345;

  // ── Segment A: opening ──────────────────────────────────────────
  let segA = '';
  const usd = fmt(ctx.portfolioUSD);
  const topToken = ctx.topTokenSymbols[0] ? ` on ${ctx.topTokenSymbols[0]}` : '';

  if (ctx.tier === 'rugged') {
    if (ctx.walletAgeDays > 365) {
      segA = `${ctx.walletAgeDays} days on-chain and ${usd} to show for it. The blockchain remembers everything, ser.`;
    } else if (ctx.walletAgeDays <= 30) {
      segA = `Fresh wallet, fresh L. You found crypto at exactly the wrong time.`;
    } else {
      segA = `You've been here ${ctx.walletAgeDays} days. The market has had time to form an opinion. It has.`;
    }
  } else if (ctx.tier === 'whale') {
    if (ctx.walletAgeDays > 730) {
      segA = `${ctx.walletAgeDays} days and ${usd}. You've earned the right to be insufferable at dinner parties.`;
    } else {
      segA = `Got to ${usd} fast${topToken}. Let's see if you can keep it.`;
    }
  } else if (ctx.tier === 'degen') {
    segA = `${ctx.chainCount} chains, ${ctx.txnCount} transactions, and a portfolio that looks like a heart monitor after a sprint. Classic.`;
  } else if (ctx.tier === 'normie') {
    if (ctx.chainCount >= 2) {
      segA = `${usd} across ${ctx.chainCount} chains. You're not a degen — you're a tourist with a hardware wallet.`;
    } else {
      segA = `${usd} in holdings, ${ctx.txnCount} transactions. You're exactly as on-chain as you think you are.`;
    }
  } else {
    // holder
    segA = `Buying and holding for ${ctx.walletAgeDays} days. Boring. But you're probably fine.`;
  }

  // ── Segment B: specific callout ────────────────────────────────
  let segB = '';

  if (ctx.unlimitedApprovals > 10) {
    segB = `You have ${ctx.unlimitedApprovals} unlimited approvals. Ser. SER. Every protocol you ever aped into has a permanent, irrevocable skeleton key to your wallet.`;
  } else if (ctx.hasMemecoin && ctx.portfolioUSD < 1000) {
    const t = ctx.topTokenSymbols[0] ?? 'a memecoin';
    segB = `Your biggest holding is ${t}. That's not an investment thesis — it's a lottery ticket with extra transaction fees and a Discord server.`;
  } else if (ctx.gasSpentUSD > ctx.portfolioUSD * 0.4 && ctx.gasSpentUSD > 50) {
    const pct = Math.round((ctx.gasSpentUSD / Math.max(ctx.portfolioUSD, 1)) * 100);
    segB = `You've spent ${fmt(ctx.gasSpentUSD)} on gas fees — ${pct}% of your entire portfolio converted directly into validator income. The miners thank you personally.`;
  } else if (ctx.portfolioDelta7d < -25) {
    segB = `Down ${Math.abs(ctx.portfolioDelta7d).toFixed(1)}% this week alone. The market isn't being mean to you — it's being honest. Brutally, personally honest.`;
  } else if (ctx.nftCount > 50) {
    segB = `${ctx.nftCount} NFTs in the collection. At some point this stopped being a portfolio and became a storage problem with aesthetic justification.`;
  } else if (ctx.chainCount >= 6) {
    const chainNames = ctx.activeChains.slice(0, 4).map(c => c.replace('-mainnet', '')).join(', ');
    segB = `${ctx.chainCount} active chains: ${chainNames}. You don't have a strategy — you have FOMO with a bridge and a tolerance for gas fees.`;
  } else if (ctx.largestTxnUSD > ctx.portfolioUSD * 0.7 && ctx.largestTxnUSD > 100) {
    const pct = Math.round((ctx.largestTxnUSD / Math.max(ctx.portfolioUSD, 1)) * 100);
    segB = `You sent ${fmt(ctx.largestTxnUSD)} in a single transaction — ${pct}% of your portfolio in one move. Respect. Or concern. The data does not indicate which.`;
  } else {
    const plural = ctx.chainCount !== 1 ? 's' : '';
    segB = `${ctx.txnCount} transactions across ${ctx.chainCount} chain${plural}. The gas fees alone should have taught you something by now. Apparently not.`;
  }

  // ── Segment C: verdict ─────────────────────────────────────────
  let segC = '';
  if (ctx.dripScore >= 86) {
    segC = `Genuinely, keep going. The chain respects you.`;
  } else if (ctx.dripScore >= 61) {
    segC = `Could be worse. Could be better. Very mid-curve energy, which is exactly where the money tends to be.`;
  } else if (ctx.dripScore >= 36) {
    segC = `There's still time. Maybe.`;
  } else if (ctx.dripScore >= 16) {
    segC = `ngmi. But we're rooting for you.`;
  } else {
    segC = `It's not too late to start over. Actually it might be. But try anyway.`;
  }

  // ── Headline ───────────────────────────────────────────────────
  let headline = '';

  if (ctx.chainCount >= 4 && ctx.txnCount === 0) {
    headline = `${ctx.chainCount} Chains. Zero Moves.`;
  } else if (ctx.txnCount > 500 && ctx.portfolioUSD < 500) {
    headline = `${ctx.txnCount.toLocaleString()} Transactions. Still Broke.`;
  } else if (ctx.tier === 'whale') {
    headline = pick(['Silent Accumulator', 'The Unstoppable Force'], seed);
  } else if (ctx.tier === 'degen') {
    headline = pick(['Controlled Chaos', 'The Insomniac', 'Perpetually Bridging'], seed);
  } else if (ctx.tier === 'holder') {
    headline = pick(['Quietly Winning', 'The Patient One', 'The Measured Operator'], seed);
  } else if (ctx.tier === 'normie') {
    headline = pick(['Chronically Average', 'Spreading Thin', 'The Spectator'], seed);
  } else {
    headline = pick(['The Ghost Wallet', 'The Cautionary Tale', 'Technically On-Chain'], seed);
  }

  return { headline, body: segA + ' ' + segB, verdict: segC };
}
