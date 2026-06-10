'use client';

import React, { useState, useMemo } from 'react';
import RadarChart from '@/components/charts/RadarChart';
import ScatterChart from '@/components/charts/ScatterChart';
import MomentumChart from '@/components/charts/MomentumChart';
import { calcFP, calcEFF, calcUSG, parseNum, formatNum } from '@/lib/stats-logic';

export default function ReportClient({ initialData }: { initialData: any }) {
  const { games, players } = initialData;
  const [selectedGameId, setSelectedGameId] = useState<string>(games.length > 0 ? games[0].GameID : '');

  const game = games.find((g: any) => g.GameID === selectedGameId);

  const gamePlayers = useMemo(() => {
    return players.filter((p: any) => p.GameID === selectedGameId).map((p: any) => {
      const fp = calcFP(p.PTS, p.OR, p.DR, p.AST, p.STL, p.BLK, p.TO);
      const eff = calcEFF(p.PTS, p.REB, p.AST, p.STL, p.BLK, p.FGA, p.FGM, p.FTA, p.FTM, p.TO);
      const usg = calcUSG(p.FGA, p.FTA, p.TO, p.MIN, game?.['Team_MIN']||200, game?.['Team_FGA']||100, game?.['Team_FTA']||20, game?.['Team_TO']||15);
      return { ...p, FP: fp, EFF: eff, USG: usg };
    }).sort((a: any, b: any) => b.FP - a.FP);
  }, [selectedGameId, players, game]);

  if (!game) return <div className="empty-state">試合データがありません</div>;

  // Chart data
  const our4Factors = [parseNum(game['Team_eFG%']), 100 - parseNum(game['Team_TO%']), parseNum(game['Team_OR%']), parseNum(game['Team_FTR'])];
  const opp4Factors = [parseNum(game['Opp_eFG%']), 100 - parseNum(game['Opp_TO%']), parseNum(game['Opp_OR%']), parseNum(game['Opp_FTR'])];

  const scatterFP = gamePlayers.map((p: any) => ({ x: p.USG, y: p.FP, r: Math.max(2, parseNum(p.PTS)/2), name: p['コートネーム']||p['選手名']||'Unknown', pts: parseNum(p.PTS) }));
  const scatterEFF = gamePlayers.map((p: any) => ({ x: p.USG, y: p.EFF, r: Math.max(2, parseNum(p.PTS)/2), name: p['コートネーム']||p['選手名']||'Unknown', pts: parseNum(p.PTS) }));

  const momentumLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
  const usScores = [parseNum(game['Q1_US']||game['1Q_US']), parseNum(game['Q2_US']||game['2Q_US']), parseNum(game['Q3_US']||game['3Q_US']), parseNum(game['Q4_US']||game['4Q_US'])];
  const oppScores = [parseNum(game['Q1_OPP']||game['1Q_OPP']), parseNum(game['Q2_OPP']||game['2Q_OPP']), parseNum(game['Q3_OPP']||game['3Q_OPP']), parseNum(game['Q4_OPP']||game['4Q_OPP'])];
  
  let cumUs = 0; let cumOpp = 0;
  const momentumData = usScores.map((s, i) => {
    cumUs += s; cumOpp += oppScores[i];
    return cumUs - cumOpp;
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg2)', padding: '12px 16px', borderRadius: '10px', marginBottom: '24px', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>対象試合</span>
        <select 
          style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '7px', padding: '6px 12px', outline: 'none' }}
          value={selectedGameId} 
          onChange={e => setSelectedGameId(e.target.value)}
        >
          {games.map((g: any) => (
            <option key={g.GameID} value={g.GameID}>{g['Date']} vs {g['Opponent']}</option>
          ))}
        </select>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span style={{ fontSize: '48px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)', lineHeight: 1 }}>{game['Team_PTS'] || game['PTS_US'] || '0'}</span>
          <span style={{ fontSize: '24px', color: 'var(--border2)' }}>—</span>
          <span style={{ fontSize: '48px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--muted)', lineHeight: 1 }}>{game['Opp_PTS'] || game['PTS_OPP'] || '0'}</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--mono)' }}>{formatNum(game['Team_PACE']||0)}</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pace</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{formatNum(game['Team_PPP']||0, 2)}</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Team PPP</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.1em' }}>4 Factors (vs Opponent)</div>
          <div style={{ height: '240px' }}>
            <RadarChart ourData={our4Factors} oppData={opp4Factors} />
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.1em' }}>Momentum (累積得失点差)</div>
          <div style={{ height: '200px' }}>
            <MomentumChart labels={momentumLabels} dataDiff={momentumData} />
          </div>
          <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '12px', color: 'var(--muted)' }}>
            最終得失点差: <span style={{ color: momentumData[3] >= 0 ? 'var(--accent2)' : 'var(--lose)', fontWeight: 'bold' }}>{momentumData[3] > 0 ? `+${momentumData[3]}` : momentumData[3]}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.1em' }}>貢献度マップ A (FP × USG%)</div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '16px' }}>右上ほど攻撃を引き受け、かつ総合的に貢献</div>
          <div style={{ height: '220px' }}>
            <ScatterChart points={scatterFP} xLabel="USG%" yLabel="FP" />
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.1em' }}>貢献度マップ B (EFF × USG%)</div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '16px' }}>右上ほど攻撃を引き受け、かつ正確にプレー</div>
          <div style={{ height: '220px' }}>
            <ScatterChart points={scatterEFF} xLabel="USG%" yLabel="EFF" />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.1em' }}>FP ランキング (この試合のMVP)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {gamePlayers.slice(0, 10).map((p: any, i: number) => {
            const maxFp = gamePlayers[0]?.FP || 1;
            const percent = Math.max(0, (p.FP / maxFp) * 100);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '80px', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p['コートネーム']||p['選手名']}</div>
                <div style={{ flex: 1, background: 'var(--bg3)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${percent}%`, background: 'var(--accent3)', height: '100%', borderRadius: '6px', transition: 'width 1s ease-out' }} />
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontSize: '13px', fontFamily: 'var(--mono)', color: 'var(--accent3)', fontWeight: 600 }}>{formatNum(p.FP, 1)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
