import { GoldRushClient } from '@covalenthq/client-sdk';

export type ApiCallStatus = 'waiting' | 'loading' | 'success' | 'error';

export type WalletData = {
  portfolioUSD: number;
  nftCount: number;
  txnCount: number;
  activeChains: string[];
  errors: string[];
};

export type ApiCallState = {
  name: string;
  endpoint: string;
  status: ApiCallStatus;
  statusCode?: number;
};

function getClient(): GoldRushClient {
  const key = import.meta.env.VITE_GOLDRUSH_API_KEY;
  if (!key) throw new Error('VITE_GOLDRUSH_API_KEY is not set');
  return new GoldRushClient(key);
}

export async function fetchWalletData(
  address: string,
  onStatusUpdate: (index: number, status: ApiCallStatus, statusCode?: number) => void
): Promise<WalletData> {
  const client = getClient();

  const calls = [
    {
      name: 'Token Balances',
      endpoint: 'BalanceService.getTokenBalancesForWalletAddress',
      fn: () => client.BalanceService.getTokenBalancesForWalletAddress('eth-mainnet', address),
    },
    {
      name: 'NFTs',
      endpoint: 'NftService.getNftsForAddress',
      fn: () => client.NftService.getNftsForAddress('eth-mainnet', address),
    },
    {
      name: 'Transactions',
      endpoint: 'TransactionService.getAllTransactionsForAddressByPage',
      fn: () => client.TransactionService.getAllTransactionsForAddressByPage('eth-mainnet', address, { noLogs: true }),
    },
    {
      name: 'Active Chains',
      endpoint: 'AllChainsService.getAddressActivity',
      fn: () => client.AllChainsService.getAddressActivity(address),
    },
  ];

  // Mark all as loading
  calls.forEach((_, i) => onStatusUpdate(i, 'loading'));

  const results = await Promise.allSettled(calls.map(c => c.fn()));

  // Update statuses with delay
  for (let i = 0; i < results.length; i++) {
    await new Promise(r => setTimeout(r, 280));
    const result = results[i];
    if (result.status === 'fulfilled') {
      onStatusUpdate(i, 'success', 200);
    } else {
      onStatusUpdate(i, 'error');
    }
  }

  const errors: string[] = [];

  // Portfolio USD
  let portfolioUSD = 0;
  if (results[0].status === 'fulfilled') {
    const items = results[0].value?.data?.items ?? [];
    portfolioUSD = items.reduce((sum: number, item: any) => {
      return sum + (item.quote ?? 0);
    }, 0);
  } else {
    errors.push('balance unavailable');
  }

  // NFT count
  let nftCount = 0;
  if (results[1].status === 'fulfilled') {
    nftCount = results[1].value?.data?.items?.length ?? 0;
  }

  // Txn count
  let txnCount = 0;
  if (results[2].status === 'fulfilled') {
    txnCount = (results[2].value?.data as any)?.pagination?.total ?? 0;
  }

  // Active chains
  let activeChains: string[] = ['eth-mainnet'];
  if (results[3].status === 'fulfilled') {
    const chainItems = results[3].value?.data?.items ?? [];
    if (chainItems.length > 0) {
      activeChains = chainItems.map((c: any) => c.name ?? c.chain_name ?? 'unknown');
    }
  }

  return { portfolioUSD, nftCount, txnCount, activeChains, errors };
}
