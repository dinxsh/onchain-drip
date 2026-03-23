import { useState, useEffect } from 'react';
import { AddressInput } from './components/AddressInput';
import { CharacterStage } from './components/CharacterStage';
import { TraitPanel } from './components/TraitPanel';
import { WalletSummary, buildTweetText } from './components/WalletSummary';
import { DripScore } from './components/DripScore';
import { fetchWalletData, ApiCallState, ApiCallStatus } from './lib/goldrush';
import { calcDripScore, getTier, Tier, TIER_COLOR } from './lib/score';
import { CharacterTraits } from './lib/character';
import { isENS, resolveENS, isAddress } from './lib/ens';

const INIT_CALLS: ApiCallState[] = [
  { name: 'Token Balances',  endpoint: 'BalanceService.getTokenBalancesForWalletAddress',      status: 'waiting' },
  { name: 'NFTs',            endpoint: 'NftService.getNftsForAddress',                          status: 'waiting' },
  { name: 'Transactions',    endpoint: 'TransactionService.getAllTransactionsForAddressByPage',  status: 'waiting' },
  { name: 'Active Chains',   endpoint: 'AllChainsService.getAddressActivity',                   status: 'waiting' },
];

type Result = {
  address: string;
  portfolioUSD: number;
  nftCount: number;
  txnCount: number;
  activeChains: string[];
  errors: string[];
  score: number;
  tier: Tier;
  traits: CharacterTraits;
};

type LBEntry = { address: string; score: number; tier: Tier };

function getLB(): LBEntry[] {
  try { return JSON.parse(localStorage.getItem('drip-lb') ?? '[]'); }
  catch { return []; }
}
function saveLB(entry: LBEntry) {
  const board = getLB();
  const i = board.findIndex(e => e.address.toLowerCase() === entry.address.toLowerCase());
  if (i >= 0) board[i] = entry; else board.push(entry);
  board.sort((a, b) => b.score - a.score);
  localStorage.setItem('drip-lb', JSON.stringify(board.slice(0, 10)));
}

export default function App() {
  const [loading, setLoading]         = useState(false);
  const [, setCalls]                  = useState<ApiCallState[]>(INIT_CALLS);
  const [result, setResult]           = useState<Result | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [toast, setToast]             = useState<string | null>(null);
  const [lb, setLb]                   = useState<LBEntry[]>(getLB());
  const [scoreAnimate, setScoreAnim]  = useState(false);
  const [copied, setCopied]           = useState(false);

  useEffect(() => {
    const addr = new URLSearchParams(window.location.search).get('address');
    if (addr) handleLookup(addr);
  }, []);

  function toast$(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleLookup(raw: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    setScoreAnim(false);
    setCalls(INIT_CALLS.map(c => ({ ...c, status: 'loading' as ApiCallStatus })));

    try {
      let address = raw.trim();
      if (isENS(address)) {
        try { address = await resolveENS(address); }
        catch { setError(`Could not resolve ENS name: ${raw}`); setLoading(false); setCalls(INIT_CALLS); return; }
      } else if (!isAddress(address)) {
        setError('Enter a valid 0x address or ENS name');
        setLoading(false); setCalls(INIT_CALLS); return;
      }

      history.pushState({}, '', `?address=${encodeURIComponent(raw.trim())}`);

      const data = await fetchWalletData(address, (idx, status, code) => {
        setCalls(prev => prev.map((c, i) => i === idx ? { ...c, status, statusCode: code } : c));
      });

      const score  = calcDripScore(data.portfolioUSD, data.activeChains.length, data.txnCount, data.nftCount);
      const tier   = getTier(score);
      const traits: CharacterTraits = {
        tier, hasNFTs: data.nftCount > 0, chainCount: data.activeChains.length,
        isWhale: score >= 86, isRugged: score <= 15, score,
      };

      setResult({ address, ...data, score, tier, traits });
      setScoreAnim(true);
      saveLB({ address, score, tier });
      setLb(getLB());

      if (data.errors.length > 0) toast$('Some data unavailable — outfit may be incomplete');

    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleShareX() {
    if (!result) return;
    const text = buildTweetText(
      result.address, result.score, result.tier,
      result.portfolioUSD, result.nftCount, result.txnCount, result.activeChains.length,
      result.activeChains
    );
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank', 'noopener,noreferrer'
    );
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => toast$('Link copied'));
  }

  function handleCopySnippet() {
    if (!result) return;
    const snippet = `import { GoldRushClient } from "@covalenthq/client-sdk";
const client = new GoldRushClient("YOUR_API_KEY");
const address = "${result.address}";

const [balances, nfts, txns, chains] = await Promise.allSettled([
  client.BalanceService.getTokenBalancesForWalletAddress("eth-mainnet", address),
  client.NftService.getNftsForAddress("eth-mainnet", address),
  client.TransactionService.getAllTransactionsForAddressByPage("eth-mainnet", address),
  client.AllChainsService.getAddressActivity(address),
]);`;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
      toast$('SDK snippet copied');
    });
  }

  const displayTier   = result?.tier ?? 'normie';
  const displayTraits = result?.traits ?? { tier: 'normie', hasNFTs: false, chainCount: 1, isWhale: false, isRugged: false, score: 50 };
  const tierColor     = TIER_COLOR[displayTier];

  return (
    <div className="min-h-screen bg-grid text-white">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">

        {/* ── Wordmark ───────────────────────────────────────────── */}
        <div className="space-y-3">
          <h1
            className="font-pixel"
            style={{
              fontSize: 'clamp(14px, 2.5vw, 20px)',
              color: '#FF4C8B',
              letterSpacing: '0.05em',
              textShadow: '0 0 24px #FF4C8B50',
              lineHeight: 1.6,
            }}
          >
            ROAST MY WALLET
          </h1>
          <p style={{ fontSize: '15px', color: '#484848', fontFamily: 'system-ui, sans-serif' }}>
            Enter any EVM address or ENS name. We pull your on-chain activity and tell you exactly what it says about you.
          </p>
        </div>

        {/* ── Input ──────────────────────────────────────────────── */}
        <div className="space-y-2">
          <AddressInput onSubmit={handleLookup} loading={loading} />
          {error && (
            <p className="font-data" style={{ fontSize: '13px', color: '#FF4C8B' }}>
              {error}
            </p>
          )}
        </div>

        {/* ── Results ────────────────────────────────────────────── */}
        {(result || loading) && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 items-start">

            {/* LEFT ─ stats + roast */}
            <div className="space-y-5">
              {result ? (
                <>
                  <TraitPanel
                    portfolioUSD={result.portfolioUSD}
                    nftCount={result.nftCount}
                    txnCount={result.txnCount}
                    activeChains={result.activeChains}
                    tier={result.tier}
                    errors={result.errors}
                  />
                  <WalletSummary
                    address={result.address}
                    portfolioUSD={result.portfolioUSD}
                    nftCount={result.nftCount}
                    txnCount={result.txnCount}
                    activeChains={result.activeChains}
                    tier={result.tier}
                    score={result.score}
                    errors={result.errors}
                  />
                </>
              ) : (
                /* skeleton */
                <div className="space-y-2">
                  {[100, 75, 90, 60, 80].map((w, i) => (
                    <div key={i} className="h-8 shimmer" style={{ width: `${w}%` }} />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT ─ character card */}
            <div
              style={{
                background: '#0A0A0A',
                border: `1px solid ${result ? tierColor + '40' : '#1C1C1C'}`,
                transition: 'border-color 0.4s',
              }}
            >
              <CharacterStage traits={result ? displayTraits : null} loading={loading} tier={displayTier} />

              <div
                className="px-5 py-5 space-y-5"
                style={{ borderTop: `1px solid ${result ? tierColor + '25' : '#1C1C1C'}` }}
              >
                <DripScore score={result?.score ?? 0} tier={displayTier} animate={scoreAnimate} />

                {result && (
                  <div className="space-y-2">
                    {/* Share on X — primary viral CTA */}
                    <button
                      onClick={handleShareX}
                      className="btn-press w-full font-pixel flex items-center justify-center gap-3"
                      style={{
                        fontSize: '9px',
                        padding: '14px',
                        background: '#fff',
                        color: '#000',
                        border: '1px solid #fff',
                        letterSpacing: '0.08em',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      SHARE ROAST
                    </button>

                    {/* Secondary actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleCopyLink}
                        className="btn-press font-pixel"
                        style={{
                          fontSize: '7px',
                          padding: '10px',
                          color: '#FF4C8B',
                          background: 'transparent',
                          border: '1px solid #FF4C8B30',
                          letterSpacing: '0.06em',
                        }}
                      >
                        COPY LINK
                      </button>
                      <button
                        onClick={handleCopySnippet}
                        className="btn-press font-pixel"
                        style={{
                          fontSize: '7px',
                          padding: '10px',
                          color: copied ? '#00E87A' : '#404040',
                          background: 'transparent',
                          border: `1px solid ${copied ? '#00E87A40' : '#1C1C1C'}`,
                          letterSpacing: '0.06em',
                        }}
                      >
                        {copied ? 'COPIED' : 'SDK SNIPPET'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────── */}
        {!result && !loading && (
          <div className="py-16 space-y-3">
            <p className="font-data text-xs" style={{ color: '#2A2A2A' }}>
              — AWAITING INPUT —
            </p>
          </div>
        )}

        {/* ── Leaderboard ─────────────────────────────────────────── */}
        {lb.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <p className="font-pixel" style={{ fontSize: '7px', color: '#2A2A2A', letterSpacing: '0.12em' }}>
                TOP SCORES
              </p>
              <div className="flex-1 h-px" style={{ background: '#1C1C1C' }} />
            </div>

            <div style={{ border: '1px solid #1C1C1C' }}>
              {lb.map((entry, i) => {
                const c = TIER_COLOR[entry.tier];
                return (
                  <div
                    key={entry.address}
                    className="lb-row grid cursor-pointer"
                    style={{
                      gridTemplateColumns: '24px 1fr 80px 48px',
                      padding: '10px 16px',
                      background: '#0A0A0A',
                      borderBottom: i < lb.length - 1 ? '1px solid #111' : 'none',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                    onClick={() => handleLookup(entry.address)}
                  >
                    <span className="font-pixel text-right" style={{ fontSize: '7px', color: '#2A2A2A' }}>
                      {i + 1}
                    </span>
                    <span className="font-data text-xs" style={{ color: '#404040' }}>
                      {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                    </span>
                    <span
                      className="font-pixel text-center"
                      style={{ fontSize: '6px', color: c, letterSpacing: '0.08em' }}
                    >
                      {entry.tier.toUpperCase()}
                    </span>
                    <span
                      className="font-pixel text-right"
                      style={{ fontSize: '10px', color: c }}
                    >
                      {entry.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Single GoldRush credit ───────────────────────────────── */}
        <div className="pt-4 border-t" style={{ borderColor: '#111' }}>
          <a
            href="https://goldrush.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-pixel inline-flex items-center gap-2 hover:opacity-60 transition-opacity"
            style={{ fontSize: '7px', color: '#2A2A2A', letterSpacing: '0.1em', textDecoration: 'none' }}
          >
            POWERED BY GOLDRUSH
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
          </a>
        </div>

      </div>

      {/* ── Toast ───────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 font-data text-xs px-4 py-2"
          style={{
            background: '#0D0D0D',
            border: '1px solid #FF4C8B40',
            color: '#FF4C8B',
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
