type Props = {
  portfolioUSD: number;
  txnCount: number;
  nftCount: number;
  chainCount: number;
  walletAgeDays: number;
  securityScore: number;
  gasSpentUSD: number;
  portfolioDelta7d: number;
  loading: boolean;
};

type Grade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';

const GPA_MAP: Record<Grade, number> = {
  'A+': 4.3, A: 4.0, 'B+': 3.3, B: 3.0, C: 2.0, D: 1.0, F: 0.0,
};

const GRADE_FILL: Record<Grade, number> = {
  'A+': 95, A: 88, 'B+': 80, B: 72, C: 55, D: 35, F: 10,
};

function gradeColor(g: Grade): string {
  if (g === 'A+' || g === 'A') return '#FFB800';
  if (g === 'B+' || g === 'B') return '#FFB800';
  if (g === 'C') return '#6B7280';
  return '#F85149';
}

function gradePortfolio(usd: number): Grade {
  if (usd >= 100000) return 'A+';
  if (usd >= 10000) return 'A';
  if (usd >= 5000) return 'B+';
  if (usd >= 1000) return 'B';
  if (usd >= 100) return 'C';
  if (usd >= 1) return 'D';
  return 'F';
}

function gradeTxn(count: number): Grade {
  if (count >= 2000) return 'A+';
  if (count >= 500) return 'A';
  if (count >= 200) return 'B+';
  if (count >= 50) return 'B';
  if (count >= 10) return 'C';
  if (count >= 1) return 'D';
  return 'F';
}

function gradeNft(count: number): Grade {
  if (count >= 100) return 'A+';
  if (count >= 30) return 'A';
  if (count >= 10) return 'B+';
  if (count >= 3) return 'B';
  if (count >= 1) return 'C';
  return 'F';
}

function gradeChains(count: number): Grade {
  if (count >= 8) return 'A+';
  if (count >= 5) return 'A';
  if (count >= 4) return 'B+';
  if (count >= 3) return 'B';
  if (count >= 2) return 'C';
  if (count >= 1) return 'D';
  return 'F';
}

function gradeLongevity(days: number): Grade {
  if (days >= 1460) return 'A+';
  if (days >= 730) return 'A';
  if (days >= 365) return 'B+';
  if (days >= 180) return 'B';
  if (days >= 60) return 'C';
  if (days >= 7) return 'D';
  return 'F';
}

function gradeSecurity(score: number): Grade {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B+';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

function gpaDesc(gpa: number): string {
  if (gpa >= 3.8) return 'Outstanding';
  if (gpa >= 3.0) return 'Respectable';
  if (gpa >= 2.0) return 'Getting by';
  if (gpa >= 1.0) return 'Needs work';
  return 'Anon, please';
}

export function ChainReportCard({
  portfolioUSD,
  txnCount,
  nftCount,
  chainCount,
  walletAgeDays,
  securityScore,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="px-card p-6 space-y-4">
        <p className="font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.12em' }}>
          CHAIN REPORT CARD
        </p>
        <div className="space-y-2">
          {[100, 80, 90, 70, 85, 75].map((w, i) => (
            <div key={i} className="h-8 shimmer" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  const rows: { label: string; grade: Grade }[] = [
    { label: 'PORTFOLIO VALUE', grade: gradePortfolio(portfolioUSD) },
    { label: 'TX ACTIVITY',     grade: gradeTxn(txnCount) },
    { label: 'NFT GAME',        grade: gradeNft(nftCount) },
    { label: 'CHAIN REACH',     grade: gradeChains(chainCount) },
    { label: 'LONGEVITY',       grade: gradeLongevity(walletAgeDays) },
    { label: 'SECURITY',        grade: gradeSecurity(securityScore) },
  ];

  const gpa = rows.reduce((sum, r) => sum + GPA_MAP[r.grade], 0) / rows.length;

  return (
    <div className="px-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.12em' }}>
          CHAIN REPORT CARD
        </p>
        <div className="text-right">
          <p className="font-pixel" style={{ fontSize: '20px', color: '#FFB800' }}>
            {gpa.toFixed(1)}
          </p>
          <p className="font-pixel" style={{ fontSize: '6px', color: '#484848' }}>
            {gpaDesc(gpa)}
          </p>
        </div>
      </div>

      <div style={{ border: '1px solid #1C1C1C' }}>
        {rows.map((row, i) => {
          const fill = GRADE_FILL[row.grade];
          const color = gradeColor(row.grade);
          return (
            <div
              key={row.label}
              className="relative flex items-center gap-4 px-4 py-3 overflow-hidden"
              style={{
                background: '#080808',
                borderBottom: i < rows.length - 1 ? '1px solid #111' : 'none',
              }}
            >
              {/* Background fill bar */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  width: `${fill}%`,
                  background: color + '08',
                  borderRight: `1px solid ${color}20`,
                }}
              />
              <p className="relative font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.1em', flex: 1 }}>
                {row.label}
              </p>
              <p className="relative font-pixel" style={{ fontSize: '14px', color, lineHeight: 1 }}>
                {row.grade}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
