'use client';

import React, { useMemo, useEffect } from 'react';
import { useGlobalState } from '@/lib/GlobalStateProvider';
import { col, parseNum } from '@/lib/stats-logic';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Activity, Shield, Swords } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ReportClient({ initialData }: { initialData: any }) {
  const { games } = initialData;
  const sortedGames = useMemo(() => {
    return [...(games || [])].reverse();
  }, [games]);

  const { globalGameId, setGlobalGameId } = useGlobalState();
  const selectedGameId = globalGameId || (sortedGames.length > 0 ? sortedGames[0].GameID : '');

  useEffect(() => {
    if (!globalGameId && sortedGames.length > 0) {
      setGlobalGameId(sortedGames[0].GameID);
    }
  }, [globalGameId, sortedGames, setGlobalGameId]);

  const game = sortedGames.find((g: any) => g.GameID === selectedGameId);

  // Parse quarters
  const q1Us = parseNum(col(game, 'team', '1q', 'pts'));
  const q2Us = parseNum(col(game, 'team', '2q', 'pts'));
  const q3Us = parseNum(col(game, 'team', '3q', 'pts'));
  const q4Us = parseNum(col(game, 'team', '4q', 'pts'));

  const q1Opp = parseNum(col(game, 'opp', '1q', 'pts'));
  const q2Opp = parseNum(col(game, 'opp', '2q', 'pts'));
  const q3Opp = parseNum(col(game, 'opp', '3q', 'pts'));
  const q4Opp = parseNum(col(game, 'opp', '4q', 'pts'));

  const chartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'HAMACHE',
        data: [q1Us, q2Us, q3Us, q4Us],
        borderColor: '#f7e04f', // var(--accent)
        backgroundColor: 'rgba(247, 224, 79, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: col(game, '対戦相手') || 'OPP',
        data: [q1Opp, q2Opp, q3Opp, q4Opp],
        borderColor: '#b535f6', // var(--accent2)
        backgroundColor: 'rgba(181, 53, 246, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#8b96ab' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#8b96ab' }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#8b96ab' }
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <select 
          style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '7px', padding: '10px 16px', outline: 'none', minWidth: '240px', fontSize: '15px' }}
          value={selectedGameId} 
          onChange={e => setGlobalGameId(e.target.value)}
        >
          {sortedGames.map((g: any) => (
            <option key={g.GameID} value={g.GameID}>{g.GameID} | {col(g, 'date')} vs {col(g, '対戦相手')}</option>
          ))}
        </select>
      </div>

      {game ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ color: 'var(--accent)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                <Shield size={32} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>HAMACHE</div>
              <div style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--accent)', textShadow: '0 0 15px rgba(247,224,79,0.3)' }}>
                {col(game, 'team', 'pts') || col(game, 'pts', 'us')}
              </div>
            </div>
            
            <div style={{ padding: '0 24px', color: 'var(--muted)', fontWeight: 600, fontSize: '14px', letterSpacing: '0.1em' }}>VS</div>

            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ color: 'var(--accent2)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                <Swords size={32} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--muted)' }}>{col(game, '対戦相手') || 'OPP'}</div>
              <div style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--accent2)', textShadow: '0 0 15px rgba(181,53,246,0.3)' }}>
                {col(game, 'opp', 'pts')}
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 5px rgba(247,224,79,0.5))' }}>
                <Activity size={24} />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.05em' }}>MOMENTUM CHART</div>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
              <Line data={chartData} options={options} />
            </div>
          </div>

        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
          データがありません
        </div>
      )}
    </div>
  );
}
