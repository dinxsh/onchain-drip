import { GoldRushClient } from '@covalenthq/client-sdk';

export type ApiCallStatus = 'waiting' | 'loading' | 'success' | 'error';

export type WalletData = {
  portfolioUSD: number;
  nftCount: number;
  txnCount: number;
  activeChains: string[];
  errors: string[];
};

export type FullWalletData = WalletData & {
  address: string;
  portfolioHistory: number[];
  portfolioDelta7d: number;
  walletAgeDays: number;
  gasSpentUSD: number;
  largestTxnUSD: number;
  topTokenSymbols: string[];
  topTokenAddresses: string[];
  hasMemecoin: boolean;
  uniqueTokenCount: number;
  unlimitedApprovals: number;
  highRiskApprovals: number;
  mediumRiskApprovals: number;
  valueAtRisk: number;
  securityScore: number;
  approvalDetails: Array<{
    spender: string;
    risk: 'low' | 'medium' | 'high';
    unlimited: boolean;
    tokenSymbol: string;
    valueUSD: number;
  }>;
};

export type ApiCallState = {
  name: string;
  endpoint: string;
  status: ApiCallStatus;
  statusCode?: number;
};

const MEMECOIN_SYMBOLS = new Set([
  'PEPE', 'DOGE', 'SHIB', 'FLOKI', 'BONK', 'WIF', 'MEME',
  'TURBO', 'WOJAK', 'LADYS', 'CHAD', 'TRUMP', 'BASED',
]);

function getClient(): GoldRushClient {
  const key = import.meta.env.VITE_GOLDRUSH_API_KEY;
  if (!key) throw new Error('VITE_GOLDRUSH_API_KEY is not set');
  return new GoldRushClient(key);
}

export const INIT_CALLS: ApiCallState[] = [
  { name: 'Token Balances',    endpoint: 'BalanceService.getTokenBalancesForWalletAddress',     status: 'waiting' },
  { name: 'NFTs',              endpoint: 'NftService.getNftsForAddress',                         status: 'waiting' },
  { name: 'Transactions',      endpoint: 'TransactionService.getAllTransactionsForAddressByPage', status: 'waiting' },
  { name: 'Active Chains',     endpoint: 'AllChainsService.getAddressActivity',                  status: 'waiting' },
  { name: 'Security Approvals',endpoint: 'SecurityService.getApprovals',                         status: 'waiting' },
  { name: 'Portfolio History', endpoint: 'BalanceService.getHistoricalPortfolioForWalletAddress',status: 'waiting' },
];

export async function fetchWalletData(
  address: string,
  onStatusUpdate: (index: number, status: ApiCallStatus, statusCode?: number) => void
): Promise<FullWalletData> {
  const client = getClient();

  const calls = [
    {
      name: 'Token Balances',
      fn: () => client.BalanceService.getTokenBalancesForWalletAddress('eth-mainnet', address),
    },
    {
      name: 'NFTs',
      fn: () => client.NftService.getNftsForAddress('eth-mainnet', address),
    },
    {
      name: 'Transactions',
      fn: () =>
        client.TransactionService.getAllTransactionsForAddressByPage('eth-mainnet', address, {
          noLogs: true,
        }),
    },
    {
      name: 'Active Chains',
      fn: () => client.AllChainsService.getAddressActivity(address),
    },
    {
      name: 'Security Approvals',
      fn: () => client.SecurityService.getApprovals('eth-mainnet', address),
    },
    {
      name: 'Portfolio History',
      fn: () =>
        client.BalanceService.getHistoricalPortfolioForWalletAddress('eth-mainnet', address),
    },
  ];

  // Mark all as loading
  calls.forEach((_, i) => onStatusUpdate(i, 'loading'));

  const results = await Promise.allSettled(calls.map((c) => c.fn()));

  // Update statuses with delay
  for (let i = 0; i < results.length; i++) {
    await new Promise((r) => setTimeout(r, 200));
    const result = results[i];
    if (result.status === 'fulfilled') {
      onStatusUpdate(i, 'success', 200);
    } else {
      onStatusUpdate(i, 'error');
    }
  }

  const errors: string[] = [];

  // ── Token Balances ────────────────────────────────────────────
  let portfolioUSD = 0;
  let topTokenSymbols: string[] = [];
  let topTokenAddresses: string[] = [];
  let hasMemecoin = false;
  let uniqueTokenCount = 0;

  if (results[0].status === 'fulfilled') {
    const items: any[] = results[0].value?.data?.items ?? [];
    portfolioUSD = items.reduce((sum: number, item: any) => sum + (item.quote ?? 0), 0);
    uniqueTokenCount = items.length;

    const sorted = [...items].sort((a: any, b: any) => (b.quote ?? 0) - (a.quote ?? 0));
    topTokenSymbols = sorted
      .slice(0, 3)
      .map((t: any) => t.contract_ticker_symbol ?? '')
      .filter(Boolean);
    topTokenAddresses = sorted
      .slice(0, 3)
      .map((t: any) => t.contract_address ?? '')
      .filter(Boolean);

    hasMemecoin = items.some(
      (t: any) => t.contract_ticker_symbol && MEMECOIN_SYMBOLS.has(t.contract_ticker_symbol.toUpperCase())
    );
  } else {
    errors.push('balance unavailable');
  }

  // ── NFT count ─────────────────────────────────────────────────
  let nftCount = 0;
  if (results[1].status === 'fulfilled') {
    nftCount = results[1].value?.data?.items?.length ?? 0;
  }

  // ── Transactions ──────────────────────────────────────────────
  let txnCount = 0;
  let walletAgeDays = 365;
  let gasSpentUSD = 0;
  let largestTxnUSD = 0;

  if (results[2].status === 'fulfilled') {
    const txData = results[2].value?.data as any;
    txnCount = txData?.pagination?.total ?? 0;

    const txItems: any[] = txData?.items ?? [];

    // Calculate gas spent
    gasSpentUSD = txItems.reduce((sum: number, tx: any) => sum + (tx.gas_quote ?? 0), 0);

    // Largest txn
    largestTxnUSD = txItems.reduce((max: number, tx: any) => {
      const val = tx.value_quote ?? 0;
      return val > max ? val : max;
    }, 0);

    // Wallet age from earliest tx
    let earliest: Date | null = null;
    for (const tx of txItems) {
      const t = tx.block_signed_at ? new Date(tx.block_signed_at) : null;
      if (t && (!earliest || t < earliest)) earliest = t;
    }
    if (earliest) {
      walletAgeDays = Math.max(
        1,
        Math.floor((Date.now() - earliest.getTime()) / (1000 * 60 * 60 * 24))
      );
    }
  }

  // ── Active chains ─────────────────────────────────────────────
  let activeChains: string[] = ['eth-mainnet'];
  if (results[3].status === 'fulfilled') {
    const chainItems = results[3].value?.data?.items ?? [];
    if (chainItems.length > 0) {
      activeChains = chainItems.map((c: any) => c.name ?? c.chain_name ?? 'unknown');
    }
  }

  // ── Security approvals ────────────────────────────────────────
  let unlimitedApprovals = 0;
  let highRiskApprovals = 0;
  let mediumRiskApprovals = 0;
  let valueAtRisk = 0;
  let securityScore = 80;
  const approvalDetails: FullWalletData['approvalDetails'] = [];

  if (results[4].status === 'fulfilled') {
    const approvalItems: any[] = results[4].value?.data?.items ?? [];

    for (const tokenItem of approvalItems) {
      const spenders: any[] = tokenItem?.spenders ?? [];
      const tokenSymbol: string = tokenItem?.ticker_symbol ?? 'UNKNOWN';
      valueAtRisk += tokenItem?.value_at_risk_quote ?? 0;

      for (const spender of spenders) {
        const allowance: string = spender?.allowance ?? '0';
        const riskFactorStr: string = spender?.risk_factor ?? '0';
        const riskFactor = parseFloat(riskFactorStr) || 0;
        const spenderValueUSD: number = spender?.value_at_risk_quote ?? 0;

        // Unlimited = very large number or "unlimited"
        const isUnlimited =
          allowance.toLowerCase() === 'unlimited' ||
          (allowance !== '0' && BigInt(allowance.replace(/[^0-9]/g, '') || '0') > BigInt('9999999999999999999'));

        if (isUnlimited) unlimitedApprovals++;
        if (riskFactor > 0.7) highRiskApprovals++;
        else if (riskFactor > 0.3) mediumRiskApprovals++;

        const riskLevel: 'low' | 'medium' | 'high' =
          riskFactor > 0.7 ? 'high' : riskFactor > 0.3 ? 'medium' : 'low';

        approvalDetails.push({
          spender: spender?.spender_address_label ?? spender?.spender_address ?? 'unknown',
          risk: riskLevel,
          unlimited: isUnlimited,
          tokenSymbol,
          valueUSD: spenderValueUSD,
        });
      }
    }

    securityScore = Math.max(
      0,
      100 - unlimitedApprovals * 8 - highRiskApprovals * 15 - mediumRiskApprovals * 5
    );
  }

  // ── Portfolio history ─────────────────────────────────────────
  let portfolioHistory: number[] = [portfolioUSD];
  let portfolioDelta7d = 0;

  if (results[5].status === 'fulfilled') {
    try {
      const portfolioItems: any[] = results[5].value?.data?.items ?? [];

      // Each item has .holdings array with daily data
      // Sum all token holdings per day to get total portfolio value
      const dayMap: Map<string, number> = new Map();

      for (const token of portfolioItems) {
        const holdings: any[] = token?.holdings ?? [];
        for (const h of holdings) {
          const day = h?.timestamp ? new Date(h.timestamp).toISOString().split('T')[0] : null;
          if (day) {
            const closeQuote = h?.close?.quote ?? 0;
            dayMap.set(day, (dayMap.get(day) ?? 0) + closeQuote);
          }
        }
      }

      if (dayMap.size > 0) {
        const sorted = Array.from(dayMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        const values = sorted.map(([, v]) => v);
        // Take last 7 values
        portfolioHistory = values.slice(-7);

        if (portfolioHistory.length >= 2) {
          const first = portfolioHistory[0];
          const last = portfolioHistory[portfolioHistory.length - 1];
          if (first > 0) {
            portfolioDelta7d = ((last - first) / first) * 100;
          }
        }
      }
    } catch {
      // keep defaults
    }
  }

  return {
    address,
    portfolioUSD,
    nftCount,
    txnCount,
    activeChains,
    errors,
    portfolioHistory,
    portfolioDelta7d,
    walletAgeDays,
    gasSpentUSD,
    largestTxnUSD,
    topTokenSymbols,
    topTokenAddresses,
    hasMemecoin,
    uniqueTokenCount,
    unlimitedApprovals,
    highRiskApprovals,
    mediumRiskApprovals,
    valueAtRisk,
    securityScore,
    approvalDetails,
  };
}
