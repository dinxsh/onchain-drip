import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

type Props = {
  values: number[];
  loading: boolean;
  address: string;
};

const LABELS = ['ACTIVITY', 'DIVERSIFY', 'NFT GAME', 'CHAIN REACH', 'LONGEVITY', 'SECURITY'];
const COLOR = '#FF4C8B';

export function RadarChart({ values, loading, address }: Props) {
  if (loading) {
    return (
      <div className="px-card p-6 flex flex-col items-center gap-3">
        <p className="font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.12em' }}>
          TRAIT RADAR
        </p>
        <div className="shimmer" style={{ width: 240, height: 240 }} />
      </div>
    );
  }

  return (
    <div className="px-card p-6 flex flex-col items-center gap-3">
      <p className="font-pixel" style={{ fontSize: '7px', color: '#404040', letterSpacing: '0.12em' }}>
        TRAIT RADAR
      </p>
      <div style={{ width: 240, height: 240 }}>
        <Radar
          data={{
            labels: LABELS,
            datasets: [
              {
                data: values,
                borderColor: COLOR,
                backgroundColor: COLOR + '20',
                borderWidth: 2,
                pointRadius: 2,
                pointBackgroundColor: COLOR,
              },
            ],
          }}
          options={{
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
            scales: {
              r: {
                min: 0,
                max: 100,
                ticks: { display: false, stepSize: 25 },
                grid: { color: 'rgba(255,255,255,0.05)' },
                angleLines: { color: 'rgba(255,255,255,0.04)' },
                pointLabels: {
                  color: '#404040',
                  font: {
                    family: "'Press Start 2P', monospace",
                    size: 6,
                  },
                },
              },
            },
            animation: false,
          }}
          width={240}
          height={240}
        />
      </div>
      <p
        className="font-data"
        style={{ fontSize: '10px', color: '#2A2A2A' }}
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </p>
    </div>
  );
}
