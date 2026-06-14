'use client';

import React, { useMemo, useEffect } from 'react';
import PlayerStatsTable from '@/components/stats/PlayerStatsTable';
import GlossaryCards from '@/components/stats/GlossaryCards';
import { calcFP, calcEFF, calcUSG, calcEFG, parseNum, formatNum, col } from '@/lib/stats-logic';
import { useGlobalState } from '@/lib/GlobalStateProvider';

export default function GameClient({ initialData }: { initialData: any }) {
  const { games, players } = initialData;
  const sortedGames = useMemo(() => {
    return [...(games || [])].reverse();
  }, [games]);
  
  const { globalGameId, setGlobalGameId, globalCategory, setGlobalCategory } = useGlobalState();
  
  const selectedGameId = globalGameId || (sortedGames.length > 0 ? sortedGames[0].GameID : '');
  const selectedCategory = globalCategory;

  useEffect(() => {
    if (!globalGameId && sortedGames.length > 0) {
      setGlobalGameId(sortedGames[0].GameID);
    }
  }, [globalGameId, sortedGames, setGlobalGameId]);

  const setSelectedGameId = setGlobalGameId;
  const setSelectedCategory = setGlobalCategory;

  const game = sortedGames.find((g: any) => g.GameID === selectedGameId);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    (games || []).forEach((g: any) => {
      // AI列は35番目（インデックス34）
      const c = col(g, 'カテゴリー') || (g._rawRow && g._rawRow[34]) || g['_col_34'];
      if (c && typeof c === 'string' && c.trim() !== '') cats.add(c.trim());
    });
    return ['全カテゴリー', ...Array.from(cats)];
  }, [games]);

  const playerRows = useMemo(() => {
    return players?.filter((p: any) => p.GameID === selectedGameId) || [];
  }, [selectedGameId, players]);

  const gamePlayers = useMemo(() => {
    const playerMap = new Map<string, any>();
    
    playerRows.forEach((p: any) => {
      const name = p['コートネーム'] || p['選手名'] || 'Unknown';
      if (!playerMap.has(name)) {
        playerMap.set(name, { 
          ...p, 
          '背番号': (p._rawRow && p._rawRow[3]) || p['背番号'] || '-', 
          PTS: '0', REB: '0', AST: '0', STL: '0', BLK: '0', TO: '0', 
          FGA: '0', FGM: '0', FTA: '0', FTM: '0', MIN: '0', OR: '0', DR: '0', 
          '2PA': '0', '2PM': '0', '3PA': '0', '3PM': '0',
          PlusMinus: '0', EFG: 0, FP: 0, EFF: 0, USG: 0 
        });
      }
      
      const exist = playerMap.get(name);
      
      ['PTS', 'REB', 'AST', 'STL', 'BLK', 'TO', 'FGA', 'FGM', 'FTA', 'FTM', 'MIN', 'OR', 'DR', '2PA', '2PM', '3PA', '3PM'].forEach(key => {
        exist[key] = (parseNum(exist[key]) + parseNum(p[key])).toString();
      });

      const pmVal = (p._rawRow && p._rawRow[27]) || p['AB'] || p['+/-'] || p['PlusMinus'] || 0;
      exist.PlusMinus = (parseNum(exist.PlusMinus) + parseNum(pmVal)).toString();
    });

    return Array.from(playerMap.values()).map((p: any) => {
      const efg = calcEFG(p.FGM, p['3PM'], p.FGA);
      const fp = calcFP(p.PTS, p.OR, p.DR, p.AST, p.STL, p.BLK, p.TO);
      const eff = calcEFF(p.PTS, (parseNum(p.OR) + parseNum(p.DR)), p.AST, p.STL, p.BLK, p.FGA, p.FGM, p.FTA, p.FTM, p.TO);
      const gameMin = parseNum(col(game, 'min')) || 40;
      const teamMinForUsg = gameMin * 5;

      const usg = calcUSG(
        p.FGA, p.FTA, p.TO, p.MIN, 
        teamMinForUsg, 
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
                const c = col(g, 'カテゴリー') || (g._rawRow && g._rawRow[34]) || g['_col_34'];
                return selectedCategory === '全カテゴリー' || (c && c.trim() === selectedCategory);
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
                const c = col(g, 'カテゴリー') || (g._rawRow && g._rawRow[34]) || g['_col_34'];
                return e.target.value === '全カテゴリー' || (c && c.trim() === e.target.value);
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

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div className="mobile-text-huge" style={{ fontSize: '64px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)', lineHeight: 1 }}>{ptsUs}</div>
          <div className="mobile-text-med" style={{ fontSize: '32px', color: 'var(--border2)' }}>—</div>
          <div className="mobile-text-huge" style={{ fontSize: '64px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--muted)', lineHeight: 1 }}>{ptsOpp}</div>
          {isWin && <div style={{ background: 'rgba(247, 224, 79, 0.15)', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em' }}>WIN</div>}
          {isLose && <div style={{ background: 'rgba(181, 53, 246, 0.15)', color: 'var(--accent2)', border: '1px solid var(--accent2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em' }}>LOSE</div>}
        </div>
        <div style={{ textAlign: 'left', minWidth: '150px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, wordBreak: 'break-word' }}>vs {col(game, '対戦相手')}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: '4px' }}>{col(game, 'date')}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'EFG%', val: formatNum(col(game, 'team', 'efg')), opp: formatNum(col(game, 'opp', 'efg')), unit: '%', color: 'var(--accent)', details: { us: `${col(game, 'team', 'fgm')}/${col(game, 'team', 'fga')} FG (3PM:${col(game, 'team', '3pm')})`, opp: `${col(game, 'opp', 'fgm')}/${col(game, 'opp', 'fga')} FG (3PM:${col(game, 'opp', '3pm')})` } },
          { label: 'TO%', val: formatNum(col(game, 'team', 'to%')), opp: formatNum(col(game, 'opp', 'to%')), unit: '%', color: 'var(--accent2)', details: { us: `TO: ${col(game, 'team', 'to')}`, opp: `TO: ${col(game, 'opp', 'to')}` } },
          { label: 'OR%', val: formatNum(col(game, 'team', 'or%')), opp: formatNum(col(game, 'opp', 'or%')), unit: '%', color: 'var(--accent)', details: { us: `OR: ${col(game, 'team', 'or')} / DR: ${col(game, 'team', 'dr')}`, opp: `OR: ${col(game, 'opp', 'or')} / DR: ${col(game, 'opp', 'dr')}` } },
          { label: 'FTR', val: formatNum(col(game, 'team', 'ftr')), opp: formatNum(col(game, 'opp', 'ftr')), color: 'var(--accent2)', details: { us: `FTA: ${col(game, 'team', 'fta')}`, opp: `FTA: ${col(game, 'opp', 'fta')}` } },
          { label: 'TEAM PPP', val: formatNum(col(game, 'team', 'ppp'), 2), opp: formatNum(col(game, 'opp', 'ppp'), 2), color: 'var(--accent)', details: { us: `PTS: ${col(game, 'team', 'pts') || col(game, 'pts', 'us')}`, opp: `PTS: ${col(game, 'opp', 'pts')}` } },
          { label: 'PACE', val: formatNum(col(game, 'pace')), opp: 'possession/40min', isTextDesc: true, color: 'var(--accent2)' }
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ padding: '20px', borderTop: `3px solid ${s.color}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '8px' }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                {s.isTextDesc ? s.opp : `相手 ${s.opp}${s.unit || ''}`}
              </div>
            </div>
            {s.details && (
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.1)', fontSize: '11px', fontFamily: 'var(--mono)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text)', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--muted)' }}>浜っち:</span>
                  <span>{s.details.us}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--muted)' }}>Opp:</span>
                  <span>{s.details.opp}</span>
                </div>
              </div>
            )}
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