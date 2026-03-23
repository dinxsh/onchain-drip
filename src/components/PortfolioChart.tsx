import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

type Props = {
  history: number[];
  delta: number;
  loading: boolean;
};

export function PortfolioChart({ history, delta, loading }: Props) {
  if (loading) {
    return (
      <div className="px-card p-6 space-y-3">
        <p className="font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.12em' }}>
          PORTFOLIO HISTORY
        </p>
        <div className="shimmer" style={{ height: '120px' }} />
      </div>
    );
  }

  const allSame = history.every((v) => v === history[0]);
  const isEmpty = history.length === 0 || allSame;

  let lineColor = '#484848';
  let label = 'STABLE (BORING)';
  if (delta > 5) {
    lineColor = '#FFB800';
    label = 'UP ONLY';
  } else if (delta < -5) {
    lineColor = '#F85149';
    label = 'MOMENT OF SILENCE';
  }

  const deltaStr =
    delta >= 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`;

  return (
    <div className="px-card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.12em' }}>
          PORTFOLIO HISTORY
        </p>
        {!isEmpty && (
          <div className="flex items-center gap-3">
            <span
              className="font-data"
              style={{
                fontSize: '18px',
                color: lineColor,
                lineHeight: 1,
              }}
            >
              {deltaStr}
            </span>
            <span className="px-tag" style={{ fontSize: '5px', color: lineColor, borderColor: lineColor + '50', background: lineColor + '10' }}>
              {label}
            </span>
          </div>
        )}
      </div>

      {isEmpty ? (
        <div
          style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <p className="font-pixel" style={{ fontSize: '7px', color: '#2A2A2A' }}>
            PORTFOLIO DATA UNAVAILABLE
          </p>
        </div>
      ) : (
        <div style={{ height: '120px' }}>
          <Line
            data={{
              labels: history.map((_, i) => `D${i + 1}`),
              datasets: [
                {
                  data: history,
                  borderColor: lineColor,
                  backgroundColor: lineColor + '15',
                  fill: true,
                  tension: 0.4,
                  borderWidth: 2,
                  pointRadius: 0,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
              },
              scales: {
                x: { display: false },
                y: { display: false },
              },
              animation: false,
            }}
          />
        </div>
      )}
    </div>
  );
}
