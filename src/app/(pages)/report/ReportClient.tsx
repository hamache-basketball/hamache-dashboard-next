'use client';

import React, { useState, useMemo, useEffect } from 'react';
import FourFactorsCards from '@/components/charts/FourFactorsCards';
import ScatterChart from '@/components/charts/ScatterChart';
import MomentumChart from '@/components/charts/MomentumChart';
import SankeyChart from '@/components/charts/SankeyChart';
import QuarterScoreChart from '@/components/charts/QuarterScoreChart';
import { calcFP, calcEFF, calcUSG, parseNum, formatNum, col } from '@/lib/stats-logic';
import { useGlobalState } from '@/lib/GlobalStateProvider';

export default function ReportClient({ initialData }: { initialData: any }) {
  const { games, players, lineups } = initialData;
  const sortedGames = useMemo(() => {
    return [...(games || [])].reverse();
  }, [games]);
  
  const { globalGameId, setGlobalGameId } = useGlobalState();
  const selectedGameId = globalGameId || (sortedGames.length > 0 ? sortedGames[0].GameID : '');
  const setSelectedGameId = setGlobalGameId;

  useEffect(() => {
    if (!globalGameId && sortedGames.length > 0) {
      setGlobalGameId(sortedGames[0].GameID);
    }
  }, [globalGameId, sortedGames, setGlobalGameId]);

  const game = sortedGames.find((g: any) => g.GameID === selectedGameId);

  const playerRows = useMemo(() => {
    return players?.filter((p: any) => p.GameID === selectedGameId) || [];
  }, [selectedGameId, players]);

  const gamePlayers = useMemo(() => {
    const playerMap = new Map<string, any>();
    playerRows.forEach((p: any) => {
      const name = p['コートネーム'] || p['選手名'] || 'Unknown';
      if (!playerMap.has(name)) {
        playerMap.set(name, { ...p });
      } else {
        const exist = playerMap.get(name);
        ['PTS', 'REB', 'AST', 'STL', 'BLK', 'TO', 'FGA', 'FGM', 'FTA', 'FTM', 'MIN', 'OR', 'DR', '2PA', '2PM', '3PA', '3PM'].forEach(key => {
          exist[key] = (parseNum(exist[key]) + parseNum(p[key])).toString();
        });
      }
    });

    return Array.from(playerMap.values()).map((p: any) => {
      const fp = calcFP(p.PTS, p.OR, p.DR, p.AST, p.STL, p.BLK, p.TO);
      const eff = calcEFF(p.PTS, p.REB, p.AST, p.STL, p.BLK, p.FGA, p.FGM, p.FTA, p.FTM, p.TO);
      const usg = calcUSG(
        p.FGA, p.FTA, p.TO, p.MIN, 
        col(game, 'team', 'min') || 200, 
        col(game, 'team', 'fga') || 100, 
        col(game, 'team', 'fta') || 20, 
        col(game, 'team', 'to') || 15
      );
      return { ...p, FP: fp, EFF: eff, USG: usg };
    }).sort((a: any, b: any) => b.FP - a.FP);
  }, [playerRows, game]);

  if (!game) return <div className="empty-state">試合データがありません</div>;

  // 4 Factors
  const our4Factors = [
    parseNum(col(game, 'team', 'efg')), 
    parseNum(col(game, 'team', 'to%')), 
    parseNum(col(game, 'team', 'or%')), 
    parseNum(col(game, 'team', 'ftr'))
  ];
  const opp4Factors = [
    parseNum(col(game, 'opp', 'efg')), 
    parseNum(col(game, 'opp', 'to%')), 
    parseNum(col(game, 'opp', 'or%')), 
    parseNum(col(game, 'opp', 'ftr'))
  ];

  // Scatter data
  const scatterFP = gamePlayers.map((p: any) => ({ 
    x: p.USG, y: p.FP, r: Math.max(2, parseNum(p.PTS)/2), 
    name: p['コートネーム']||p['選手名']||'Unknown', pts: parseNum(p.PTS) 
  }));
  const scatterEFF = gamePlayers.map((p: any) => ({ 
    x: p.USG, y: p.EFF, r: Math.max(2, parseNum(p.PTS)/2), 
    name: p['コートネーム']||p['選手名']||'Unknown', pts: parseNum(p.PTS) 
  }));

  // Momentum (Lineups data)
  const lineupRows = lineups ? lineups.filter((r: any) => r.GameID === selectedGameId) : [];
  const periods = ['1Q', '2Q', '3Q', '4Q'];
  const periodData = periods.map(q => {
    const qRows = lineupRows.filter((r: any) => r.Period === q);
    if (!qRows.length) return { q, us: 0, opp: 0 };
    const us = Math.max(...qRows.map((r: any) => parseNum(r.Score_Us_End))) - Math.min(...qRows.map((r: any) => parseNum(r.Score_Us_Start)));
    const opp = Math.max(...qRows.map((r: any) => parseNum(r.Score_Opp_End))) - Math.min(...qRows.map((r: any) => parseNum(r.Score_Opp_Start)));
    return { q, us, opp };
  });

  const momentumLabels = ['開始', '1Q', '2Q', '3Q', '4Q'];
  let cumUs = 0; let cumOpp = 0;
  const momentumData = [0];
  periodData.forEach(p => {
    cumUs += p.us; cumOpp += p.opp;
    momentumData.push(cumUs - cumOpp);
  });
  const finalDiff = momentumData[momentumData.length - 1];

  // Sankey Stats
  const sankeyStats = {
    pa2: playerRows.reduce((a: number, r: any) => a + parseNum(r['2PA']), 0),
    pm2: playerRows.reduce((a: number, r: any) => a + parseNum(r['2PM']), 0),
    pa3: playerRows.reduce((a: number, r: any) => a + parseNum(r['3PA']), 0),
    pm3: playerRows.reduce((a: number, r: any) => a + parseNum(r['3PM']), 0),
    fta: playerRows.reduce((a: number, r: any) => a + parseNum(r['FTA']), 0),
    ftm: playerRows.reduce((a: number, r: any) => a + parseNum(r['FTM']), 0),
    to: playerRows.reduce((a: number, r: any) => a + parseNum(r['TO']), 0),
    orb: playerRows.reduce((a: number, r: any) => a + parseNum(r['OR']), 0),
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg2)', padding: '12px 16px', borderRadius: '10px', marginBottom: '24px', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>対象試合</span>
        <select 
          style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '7px', padding: '6px 12px', outline: 'none' }}
          value={selectedGameId} 
          onChange={e => setSelectedGameId(e.target.value)}
        >
          {sortedGames.map((g: any) => (
            <option key={g.GameID} value={g.GameID}>{g.GameID} — {col(g, 'date')} vs {col(g, '対戦相手')}</option>
          ))}
        </select>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span style={{ fontSize: '48px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)', lineHeight: 1 }}>{col(game, 'team', 'pts') || col(game, 'pts', 'us') || '0'}</span>
          <span style={{ fontSize: '24px', color: 'var(--border2)' }}>—</span>
          <span style={{ fontSize: '48px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--muted)', lineHeight: 1 }}>{col(game, 'opp', 'pts') || '0'}</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--mono)' }}>{formatNum(col(game, 'pace')||0)}</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pace</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{formatNum(col(game, 'team', 'ppp')||0, 2)}</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Team PPP</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', border: '1px solid var(--border2)', fontSize: '10px' }}>1</span>
          4 FACTORS - 勝敗を分けた4指標
        </div>
        <FourFactorsCards ourData={our4Factors} oppData={opp4Factors} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', border: '1px solid var(--border2)', fontSize: '10px' }}>2</span>
            ピリオド別スコア
          </div>
          <div style={{ height: '200px' }}>
            <QuarterScoreChart data={periodData} />
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', border: '1px solid var(--border2)', fontSize: '10px' }}>3</span>
            Momentum (累積得失点差)
          </div>
          <div style={{ height: '200px' }}>
            <MomentumChart labels={momentumLabels} dataDiff={momentumData} />
          </div>
          <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '12px', color: 'var(--muted)' }}>
            最終得失点差: <span style={{ color: finalDiff >= 0 ? 'var(--accent2)' : 'var(--lose)', fontWeight: 'bold' }}>{finalDiff > 0 ? `+${finalDiff}` : finalDiff}</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', border: '1px solid var(--border2)', fontSize: '10px' }}>4</span>
          攻撃ポゼッションの内訳フロー (Sankey Diagram)
        </div>
        <SankeyChart {...sankeyStats} />
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
            <ScatterChart points={scatterEFF} xLabel="USG%" yLabel="EFF" color="#4f8ef7" />
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
