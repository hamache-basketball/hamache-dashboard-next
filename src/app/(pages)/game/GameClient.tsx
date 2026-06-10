'use client';

import React, { useState, useMemo } from 'react';
import PlayerStatsTable from '@/components/stats/PlayerStatsTable';
import GlossaryCards from '@/components/stats/GlossaryCards';
import { calcFP, calcEFF, calcUSG, calcEFG, parseNum, formatNum, col } from '@/lib/stats-logic';

export default function GameClient({ initialData }: { initialData: any }) {
  const { games, players } = initialData;
  const sortedGames = useMemo(() => {
    return [...(games || [])].reverse();
  }, [games]);
  
  const [selectedGameId, setSelectedGameId] = useState<string>(sortedGames.length > 0 ? sortedGames[0].GameID : '');
  const [selectedCategory, setSelectedCategory] = useState<string>('全カテゴリー');

  const game = sortedGames.find((g: any) => g.GameID === selectedGameId);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    (games || []).forEach((g: any) => {
      const c = col(g, 'カテゴリー') || g['_col_34'];
      if (c && c.trim() !== '') cats.add(c);
    });
    return ['全カテゴリー', ...Array.from(cats)];
  }, [games]);

  const playerRows = useMemo(() => {
    return players?.filter((p: any) => p.GameID === selectedGameId) || [];
  }, [selectedGameId, players]);

  const gamePlayers = useMemo(() => {
    // D列（4列目）のキー名を取得
    const jerseyKey = playerRows.length > 0 ? Object.keys(playerRows[0])[3] : '背番号';
    
    const playerMap = new Map<string, any>();
    playerRows.forEach((p: any) => {
      const name = p['コートネーム'] || p['選手名'] || 'Unknown';
      if (!playerMap.has(name)) {
        playerMap.set(name, { ...p, '背番号': p[jerseyKey] || p['背番号'] || '-', EFG: 0, FP: 0, EFF: 0, USG: 0, PlusMinus: 0 });
      }
      
      const exist = playerMap.get(name);
      
      if (playerMap.has(name) && playerMap.get(name) !== p) {
        ['PTS', 'REB', 'AST', 'STL', 'BLK', 'TO', 'FGA', 'FGM', 'FTA', 'FTM', 'MIN', 'OR', 'DR', '2PA', '2PM', '3PA', '3PM'].forEach(key => {
          if (p[key]) exist[key] = (parseNum(exist[key]) + parseNum(p[key])).toString();
        });
      }

      // +/- column is around AB (28th column). We'll try to find it.
      const pmKey = Object.keys(p).find(k => k.includes('+') || k.toLowerCase().includes('plus') || k === 'AB');
      if (pmKey && p[pmKey]) {
        exist.PlusMinus = (parseNum(exist.PlusMinus) + parseNum(p[pmKey])).toString();
      }
    });

    return Array.from(playerMap.values()).map((p: any) => {
      const efg = calcEFG(p.FGM, p['3PM'], p.FGA);
      const fp = calcFP(p.PTS, p.OR, p.DR, p.AST, p.STL, p.BLK, p.TO);
      const eff = calcEFF(p.PTS, (parseNum(p.OR) + parseNum(p.DR)), p.AST, p.STL, p.BLK, p.FGA, p.FGM, p.FTA, p.FTM, p.TO);
      const usg = calcUSG(
        p.FGA, p.FTA, p.TO, p.MIN, 
        col(game, 'team', 'min') || 200, 
        col(game, 'team', 'fga') || 100, 
        col(game, 'team', 'fta') || 20, 
        col(game, 'team', 'to') || 15
      );

      return { ...p, EFG: efg, FP: fp, EFF: eff, USG: usg };
    }).sort((a: any, b: any) => {
      // 1. PTS降順
      const ptsDiff = parseNum(b.PTS) - parseNum(a.PTS);
      if (ptsDiff !== 0) return ptsDiff;
      // 2. PTSが同じ場合は背番号（#）昇順
      return parseNum(a['背番号']) - parseNum(b['背番号']);
    });
  }, [playerRows, game]);

  if (!game) return <div className="empty-state">試合データがありません</div>;

  const ptsUs = parseNum(col(game, 'team', 'pts') || col(game, 'pts', 'us') || '0');
  const ptsOpp = parseNum(col(game, 'opp', 'pts') || '0');
  const isWin = ptsUs > ptsOpp;
  const isLose = ptsUs < ptsOpp;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>試合分析</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>試合ごとのチーム・選手スタッツを確認</p>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>試合</span>
          <select 
            style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '7px', padding: '8px 12px', outline: 'none', minWidth: '240px' }}
            value={selectedGameId} 
            onChange={e => setSelectedGameId(e.target.value)}
          >
            {sortedGames
              .filter((g: any) => {
                const c = col(g, 'カテゴリー') || g['_col_34'];
                return selectedCategory === '全カテゴリー' || c === selectedCategory;
              })
              .map((g: any) => (
                <option key={g.GameID} value={g.GameID}>{g.GameID} — {col(g, 'date')} vs {col(g, '対戦相手')}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>カテゴリー</span>
          <select 
            style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '7px', padding: '8px 12px', outline: 'none', minWidth: '160px' }}
            value={selectedCategory} 
            onChange={e => {
              setSelectedCategory(e.target.value);
              // reset selected game to the first one in the new category
              const newGames = sortedGames.filter((g: any) => {
                const c = col(g, 'カテゴリー') || g['_col_34'];
                return e.target.value === '全カテゴリー' || c === e.target.value;
              });
              if (newGames.length > 0) setSelectedGameId(newGames[0].GameID);
            }}
          >
            {categories.map((c: string) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px 40px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '64px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)', lineHeight: 1 }}>{ptsUs}</div>
          <div style={{ fontSize: '32px', color: 'var(--border2)' }}>—</div>
          <div style={{ fontSize: '64px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--muted)', lineHeight: 1 }}>{ptsOpp}</div>
          {isWin && <div style={{ background: 'rgba(56, 217, 169, 0.15)', color: 'var(--accent2)', border: '1px solid var(--accent2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em' }}>WIN</div>}
          {isLose && <div style={{ background: 'rgba(240, 111, 111, 0.15)', color: 'var(--lose)', border: '1px solid var(--lose)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em' }}>LOSE</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>vs {col(game, '対戦相手')}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: '4px' }}>{col(game, 'date')}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'EFG%', val: formatNum(col(game, 'team', 'efg')), opp: formatNum(col(game, 'opp', 'efg')), unit: '%', color: '#4f8ef7' },
          { label: 'TO%', val: formatNum(col(game, 'team', 'to%')), opp: formatNum(col(game, 'opp', 'to%')), unit: '%', color: '#f06f6f' },
          { label: 'OR%', val: formatNum(col(game, 'team', 'or%')), opp: formatNum(col(game, 'opp', 'or%')), unit: '%', color: '#38d9a9' },
          { label: 'PACE', val: formatNum(col(game, 'pace')), opp: 'possession/40min', isTextDesc: true, color: '#f7a84f' },
          { label: 'TEAM PPP', val: formatNum(col(game, 'team', 'ppp'), 2), opp: formatNum(col(game, 'opp', 'ppp'), 2), color: '#38d9a9' },
          { label: 'FTR', val: formatNum(col(game, 'team', 'ftr')), opp: formatNum(col(game, 'opp', 'ftr')), color: '#4f8ef7' }
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ padding: '20px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '8px' }}>{s.val}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
              {s.isTextDesc ? s.opp : `相手 ${s.opp}${s.unit || ''}`}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>選手スタッツ（この試合・全ピリオド合算）</div>
        <PlayerStatsTable players={gamePlayers} />
      </div>

      <GlossaryCards />
    </div>
  );
}
