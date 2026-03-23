type Props = {
  securityScore: number;
  valueAtRisk: number;
  unlimitedApprovals: number;
  highRiskApprovals: number;
  mediumRiskApprovals: number;
  approvalDetails: Array<{
    spender: string;
    risk: 'low' | 'medium' | 'high';
    unlimited: boolean;
    tokenSymbol: string;
    valueUSD: number;
  }>;
  address: string;
  loading: boolean;
};

function fmt(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`;
  if (usd > 0) return `$${usd.toFixed(2)}`;
  return '$0';
}

function riskColor(risk: 'low' | 'medium' | 'high'): string {
  if (risk === 'high') return '#F85149';
  if (risk === 'medium') return '#FF8C00';
  return '#00E87A';
}

function securityColor(score: number): string {
  if (score > 80) return '#00E87A';
  if (score >= 60) return '#FFB800';
  return '#F85149';
}

export function SecurityPanel({
  securityScore,
  valueAtRisk,
  unlimitedApprovals,
  highRiskApprovals,
  mediumRiskApprovals,
  approvalDetails,
  address,
  loading,
}: Props) {
  const roastLine =
    securityScore > 80
      ? 'Clean wallet. Suspicious, actually.'
      : securityScore >= 60
      ? 'A few skeletons in the approval closet. Classic degen.'
      : securityScore >= 40
      ? `You have ${unlimitedApprovals} unlimited approvals. Every protocol you ever aped into owns a piece of you.`
      : `Your wallet is basically a public toilet. ${highRiskApprovals} contracts could drain you right now.`;

  if (loading) {
    return (
      <div className="px-card p-6 space-y-4">
        <p className="font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.12em' }}>
          APPROVAL RISK
        </p>
        <div className="space-y-2">
          {[100, 60, 80, 50, 70].map((w, i) => (
            <div key={i} className="h-6 shimmer" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-card p-6 space-y-5">
      <p className="font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.12em' }}>
        APPROVAL RISK
      </p>

      {/* 3-stat row */}
      <div className="grid grid-cols-3 gap-px" style={{ background: '#1C1C1C' }}>
        {/* Value at risk */}
        <div className="px-4 py-3 space-y-1" style={{ background: '#0D0D0D' }}>
          <p className="font-pixel" style={{ fontSize: '6px', color: '#404040', letterSpacing: '0.1em' }}>
            VALUE AT RISK
          </p>
          <p
            className="font-data"
            style={{
              fontSize: '20px',
              color: valueAtRisk > 1000 ? '#F85149' : '#484848',
              lineHeight: 1,
            }}
          >
            {fmt(valueAtRisk)}
          </p>
        </div>

        {/* Unlimited approvals */}
        <div className="px-4 py-3 space-y-1" style={{ background: '#0D0D0D' }}>
          <p className="font-pixel" style={{ fontSize: '6px', color: '#404040', letterSpacing: '0.1em' }}>
            UNLIMITED
          </p>
          <p
            className="font-data"
            style={{
              fontSize: '20px',
              color: unlimitedApprovals > 0 ? '#F85149' : '#484848',
              lineHeight: 1,
            }}
          >
            {unlimitedApprovals}
          </p>
        </div>

        {/* Security score */}
        <div className="px-4 py-3 space-y-1" style={{ background: '#0D0D0D' }}>
          <p className="font-pixel" style={{ fontSize: '6px', color: '#404040', letterSpacing: '0.1em' }}>
            SEC SCORE
          </p>
          <p
            className="font-pixel"
            style={{
              fontSize: '20px',
              color: securityColor(securityScore),
              lineHeight: 1,
            }}
          >
            {securityScore}
          </p>
        </div>
      </div>

      {/* Roast line */}
      <p style={{ fontSize: '14px', color: '#C8C8C8', fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }}>
        {roastLine}
      </p>

      {/* Approval detail table */}
      {approvalDetails.length > 0 && (
        <div className="space-y-2">
          <p className="font-pixel" style={{ fontSize: '6px', color: '#2A2A2A', letterSpacing: '0.1em' }}>
            TOP APPROVALS
          </p>
          <div style={{ border: '1px solid #1C1C1C' }}>
            {approvalDetails.slice(0, 5).map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 px-3 py-2"
                style={{
                  background: '#080808',
                  borderBottom: i < Math.min(approvalDetails.length, 5) - 1 ? '1px solid #111' : 'none',
                }}
              >
                <span className="font-data" style={{ fontSize: '11px', color: '#484848', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.spender.length > 20 ? d.spender.slice(0, 8) + '...' + d.spender.slice(-4) : d.spender}
                </span>
                <span className="font-pixel" style={{ fontSize: '6px', color: '#484848' }}>
                  {d.tokenSymbol}
                </span>
                {d.unlimited && (
                  <span className="px-tag" style={{ fontSize: '5px', color: '#F85149', borderColor: '#F8514950', background: '#F8514910' }}>
                    UNLIM
                  </span>
                )}
                <span
                  className="px-tag shrink-0"
                  style={{
                    fontSize: '5px',
                    color: riskColor(d.risk),
                    borderColor: riskColor(d.risk) + '50',
                    background: riskColor(d.risk) + '10',
                  }}
                >
                  {d.risk.toUpperCase()}
                </span>
                <span className="font-data" style={{ fontSize: '11px', color: '#484848' }}>
                  {fmt(d.valueUSD)}
                </span>
              </div>
            ))}
          </div>
          <p className="font-pixel" style={{ fontSize: '6px', color: '#2A2A2A', letterSpacing: '0.08em' }}>
            H:{highRiskApprovals} M:{mediumRiskApprovals} TOTAL RISK APPROVALS
          </p>
        </div>
      )}

      {/* Revoke button */}
      <a
        href={`https://revoke.cash/?address=${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-press font-pixel block text-center"
        style={{
          fontSize: '7px',
          padding: '12px',
          color: '#F85149',
          border: '1px solid #F8514940',
          background: 'transparent',
          letterSpacing: '0.08em',
          textDecoration: 'none',
          display: 'block',
        }}
      >
        REVOKE RISKY APPROVALS
      </a>
    </div>
  );
}
