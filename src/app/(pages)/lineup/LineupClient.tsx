'use client';

import React, { useState, useMemo } from 'react';
import { parseNum, col } from '@/lib/stats-logic';

export default function LineupClient({ initialData }: { initialData: any }) {
  const { games, lineups } = initialData;

  // Games extraction and sorting
  const sortedGames = useMemo(() => {
    if (!games) return [];
    return [...games].sort((a: any, b: any) => {
      const dateA = new Date(col(a, 'date')).getTime();
      const dateB = new Date(col(b, 'date')).getTime();
      return dateB - dateA; // 新しい順
    });
  }, [games]);

  const [selectedGameId, setSelectedGameId] = useState<string>(sortedGames.length > 0 ? sortedGames[0].GameID : '');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('全ピリオド');

  const periods = ['全ピリオド', '1Q', '2Q', '3Q', '4Q'];

  // Filter and process lineups
  const displayLineups = useMemo(() => {
    if (!lineups) return [];

    let filtered = lineups.filter((l: any) => {
      const row = l._rawRow || [];
      const gameId = row[0] || l.GameID;
      const period = row[1] || l.Period;
      
      if (gameId !== selectedGameId) return false;
      if (selectedPeriod !== '全ピリオド' && period !== selectedPeriod) return false;
      
      return true;
    });

    // Map the needed fields
    const mapped = filtered.map((l: any) => {
      const row = l._rawRow || [];
      const period = row[1] || l.Period;
      const duration = row[4] || l.Duration;
      const scoreUsStart = row[5] || l.Score_Us_Start;
      const scoreUsEnd = row[6] || l.Score_Us_End;
      const scoreOppStart = row[7] || l.Score_Opp_Start;
      const scoreOppEnd = row[8] || l.Score_Opp_End;
      const diff = row[9] || l.Diff;
      const p1 = row[15] || l.P1_Name;
      const p2 = row[16] || l.P2_Name;
      const p3 = row[17] || l.P3_Name;
      const p4 = row[18] || l.P4_Name;
      const p5 = row[19] || l.P5_Name;

      return {
        period,
        duration,
        scoreUsStart, scoreUsEnd,
        scoreOppStart, scoreOppEnd,
        diff: parseNum(diff),
        players: [p1, p2, p3, p4, p5].filter(Boolean)
      };
    });

    // Sort by Diff descending
    return mapped.sort((a: any, b: any) => b.diff - a.diff);
  }, [lineups, selectedGameId, selectedPeriod]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>ラインナップ分析</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>5人の組み合わせごとの得失点差を確認</p>
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>試合</span>
          <select 
            style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '7px', padding: '8px 12px', outline: 'none', minWidth: '280px' }}
            value={selectedGameId} 
            onChange={e => setSelectedGameId(e.target.value)}
          >
            {sortedGames.map((g: any) => (
              <option key={g.GameID} value={g.GameID}>
                {g.GameID} — {col(g, 'date')} vs {col(g, '対戦相手')}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>ピリオド</span>
          <select 
            style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '7px', padding: '8px 12px', outline: 'none', minWidth: '120px' }}
            value={selectedPeriod} 
            onChange={e => setSelectedPeriod(e.target.value)}
          >
            {periods.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lineup List */}
      <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--muted)' }}>
        ラインナップ別成績（得失点差 降順）
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {displayLineups.length > 0 ? (
          displayLineups.map((l: any, i: number) => {
            const isPositive = l.diff > 0;
            const isNegative = l.diff < 0;
            
            return (
              <div key={i} className="glass-panel" style={{ padding: '24px' }}>
                {/* Players */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  {l.players.map((p: any, idx: number) => (
                    <div key={idx} style={{ 
                      padding: '8px 20px', 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '20px', 
                      fontSize: '13px',
                      border: '1px solid var(--border2)' 
                    }}>
                      {p}
                    </div>
                  ))}
                </div>
                
                {/* Stats row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', fontSize: '13px' }}>
                  <div style={{ display: 'flex', gap: '8px', color: 'var(--muted)' }}>
                    <span>出場</span>
                    <strong style={{ color: 'var(--text)' }}>{l.duration}分</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', color: 'var(--muted)' }}>
                    <span>スコア</span>
                    <strong style={{ color: 'var(--text)' }}>
                      {l.scoreUsStart}-{l.scoreOppStart} / {l.scoreUsEnd}-{l.scoreOppEnd}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', color: 'var(--muted)' }}>
                    <span>ピリオド</span>
                    <strong style={{ color: 'var(--text)' }}>{l.period}</strong>
                  </div>
                  <div style={{ 
                    display: 'flex', gap: '8px', alignItems: 'center', 
                    padding: '4px 16px', 
                    borderRadius: '16px',
                    background: isPositive ? 'rgba(56, 217, 169, 0.15)' : isNegative ? 'rgba(240, 111, 111, 0.15)' : 'rgba(255,255,255,0.08)',
                    color: isPositive ? 'var(--accent2)' : isNegative ? 'var(--lose)' : 'var(--muted)',
                    marginLeft: 'auto'
                  }}>
                    <span style={{ fontSize: '12px' }}>得失点差</span>
                    <strong style={{ fontSize: '15px' }}>{l.diff > 0 ? `+${l.diff}` : l.diff}</strong>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            該当するラインナップデータがありません
          </div>
        )}
      </div>
    </div>
  );
}
