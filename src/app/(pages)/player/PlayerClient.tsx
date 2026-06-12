'use client';

import React, { useState, useMemo } from 'react';
import PlayerStatsTable from '@/components/stats/PlayerStatsTable';
import GlossaryCards from '@/components/stats/GlossaryCards';
import { calcFP, calcEFF, calcUSG, calcEFG, parseNum, formatNum, col } from '@/lib/stats-logic';
import { useGlobalState } from '@/lib/GlobalStateProvider';

const lineToCubicBezier = (points: [number, number][]) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0][0]},${points[0][1]}`;
  
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 === points.length ? i + 1 : i + 2];
    
    const cp1x = p1[0] + (p2[0] - p0[0]) * 0.15;
    const cp1y = p1[1] + (p2[1] - p0[1]) * 0.15;
    const cp2x = p2[0] - (p3[0] - p1[0]) * 0.15;
    const cp2y = p2[1] - (p3[1] - p1[1]) * 0.15;
    
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  return d;
};

export default function PlayerClient({ initialData }: { initialData: any }) {
  const { games, players } = initialData;

  const { globalCategory, setGlobalCategory, globalPlayerName, setGlobalPlayerName } = useGlobalState();
  const selectedCategory = globalCategory;
  const setSelectedCategory = setGlobalCategory;

  const selectedPlayerName = globalPlayerName;
  const setSelectedPlayerName = setGlobalPlayerName;

  // Categories extraction
  const categories = useMemo(() => {
    const cats = new Set<string>();
    (games || []).forEach((g: any) => {
      const c = col(g, 'カテゴリー') || (g._rawRow && g._rawRow[34]) || g['_col_34'];
      if (c && typeof c === 'string' && c.trim() !== '') cats.add(c.trim());
    });
    return ['全カテゴリー', ...Array.from(cats)];
  }, [games]);

  // Aggregate players per game
  const aggregatedPlayersByGame = useMemo(() => {
    const map = new Map<string, any>();
    (players || []).forEach((p: any) => {
      const gameId = p.GameID;
      const rawJersey = (p._rawRow && p._rawRow[3]) || p['背番号'] || '-';
      const name = p['コートネーム'] || p['選手名'] || 'Unknown';
      const key = `${gameId}_${name}`;
      
      if (!map.has(key)) {
        map.set(key, { 
          ...p, '背番号': rawJersey, PlusMinus: 0, 
          PTS: 0, REB: 0, AST: 0, STL: 0, BLK: 0, TO: 0, 
          FGA: 0, FGM: 0, FTA: 0, FTM: 0, MIN: 0, OR: 0, DR: 0, '2PA': 0, '2PM': 0, '3PA': 0, '3PM': 0 
        });
      }
      const exist = map.get(key);
      ['PTS', 'REB', 'AST', 'STL', 'BLK', 'TO', 'FGA', 'FGM', 'FTA', 'FTM', 'MIN', 'OR', 'DR', '2PA', '2PM', '3PA', '3PM'].forEach(k => {
        if (p[k]) exist[k] = (parseNum(exist[k]) + parseNum(p[k])).toString();
      });
      
      // AB column (index 27) for +/-
      const pm = (p._rawRow && p._rawRow[27]) || p['AB'] || p['+/-'] || p['PlusMinus'];
      if (pm) {
        exist.PlusMinus += parseNum(pm);
      }
    });
    
    return Array.from(map.values()).map(p => {
      const game = (games || []).find((g: any) => g.GameID === p.GameID);
      const efg = calcEFG(p.FGM, p['3PM'], p.FGA);
      const fp = calcFP(p.PTS, p.OR, p.DR, p.AST, p.STL, p.BLK, p.TO);
      const eff = calcEFF(p.PTS, (parseNum(p.OR) + parseNum(p.DR)), p.AST, p.STL, p.BLK, p.FGA, p.FGM, p.FTA, p.FTM, p.TO);
      
      let usg = 0;
      if (game) {
        usg = calcUSG(
          p.FGA, p.FTA, p.TO, p.MIN, 
          col(game, 'team', 'min') || 200, 
          col(game, 'team', 'fga') || 100, 
          col(game, 'team', 'fta') || 20, 
          col(game, 'team', 'to') || 15
        );
      }
      
      return { ...p, EFG: efg, FP: fp, EFF: eff, USG: usg, gameObj: game };
    });
  }, [players, games]);

  const filteredPlayerGames = useMemo(() => {
    return aggregatedPlayersByGame.filter(p => {
      if (!p.gameObj) return false;
      const c = col(p.gameObj, 'カテゴリー') || (p.gameObj._rawRow && p.gameObj._rawRow[34]) || p.gameObj['_col_34'];
      return selectedCategory === '全カテゴリー' || (c && c.trim() === selectedCategory);
    });
  }, [aggregatedPlayersByGame, selectedCategory]);

  // Unique players for dropdown
  const uniquePlayers = useMemo(() => {
    const pSet = new Map<string, string>(); // name -> jersey
    filteredPlayerGames.forEach(p => {
      const name = p['コートネーム'] || p['選手名'] || 'Unknown';
      if (!pSet.has(name) || pSet.get(name) === '-') {
        pSet.set(name, p['背番号']);
      }
    });
    const arr = Array.from(pSet.entries()).map(([name, jersey]) => ({ name, jersey }));
    arr.sort((a, b) => {
      const numA = parseNum(a.jersey) || 999;
      const numB = parseNum(b.jersey) || 999;
      return numA - numB;
    });
    return arr;
  }, [filteredPlayerGames]);

  // Auto-select first player if none selected
  React.useEffect(() => {
    if (!selectedPlayerName && uniquePlayers.length > 0) {
      setSelectedPlayerName(uniquePlayers[0].name);
    }
  }, [uniquePlayers, selectedPlayerName]);

  // Team Averages per Player
  const teamAverages = useMemo(() => {
    const pMap = new Map<string, any>();
    filteredPlayerGames.forEach(p => {
      const name = p['コートネーム'] || p['選手名'] || 'Unknown';
      if (!pMap.has(name)) pMap.set(name, { games: 0, pts: 0, ast: 0, reb: 0, stl: 0, blk: 0, fga: 0, fgm: 0, fta: 0, ftm: 0, to: 0, min: 0, pm: 0, effSum: 0, p3m: 0, teamMin: 0, teamFga: 0, teamFta: 0, teamTo: 0 });
      const exist = pMap.get(name);
      if (parseNum(p.MIN) > 0) {
        exist.games += 1;
        exist.pts += parseNum(p.PTS);
        exist.ast += parseNum(p.AST);
        exist.reb += (parseNum(p.OR) + parseNum(p.DR));
        exist.stl += parseNum(p.STL);
        exist.blk += parseNum(p.BLK);
        exist.fga += parseNum(p.FGA);
        exist.fgm += parseNum(p.FGM);
        exist.fta += parseNum(p.FTA);
        exist.ftm += parseNum(p.FTM);
        exist.p3m += parseNum(p['3PM']);
        exist.to += parseNum(p.TO);
        exist.min += parseNum(p.MIN);
        exist.pm += p.PlusMinus;
        exist.effSum += p.EFF;

        if (p.gameObj) {
          const gMin = parseNum(col(p.gameObj, 'min')) || 40;
          exist.teamMin += gMin * 5;
          exist.teamFga += parseNum(col(p.gameObj, 'team', 'fga'));
          exist.teamFta += parseNum(col(p.gameObj, 'team', 'fta'));
          exist.teamTo += parseNum(col(p.gameObj, 'team', 'to'));
        }
      }
    });
    
    const averages: Record<string, any> = {};
    let teamTotalPts = 0;
    let teamTotalGames = 0;
    
    for (const [name, data] of Array.from(pMap.entries())) {
      if (data.games > 0) {
        teamTotalPts += data.pts;
        teamTotalGames += data.games;
        averages[name] = {
          name,
          PTS: data.pts / data.games,
          AST: data.ast / data.games,
          REB: data.reb / data.games,
          STL: data.stl / data.games,
          BLK: data.blk / data.games,
          USG: calcUSG(data.fga, data.fta, data.to, data.min, data.teamMin, data.teamFga, data.teamFta, data.teamTo),
          EFF: data.effSum / data.games,
          PM: data.pm / data.games,
          EFG: calcEFG(data.fgm, data.p3m, data.fga),
          FTP: data.fta > 0 ? (data.ftm / data.fta) * 100 : 0,
          PPP: data.fga + 0.44 * data.fta + data.to > 0 ? data.pts / (data.fga + 0.44 * data.fta + data.to) : 0,
        };
      }
    }
    
    const teamAvgPts = teamTotalGames > 0 ? teamTotalPts / teamTotalGames : 0;
    
    return { averages, teamAvgPts };
  }, [filteredPlayerGames]);

  // Selected Player Data
  const selectedPlayerAverages = teamAverages.averages[selectedPlayerName] || {};
  
  const selectedPlayerGames = useMemo(() => {
    return filteredPlayerGames
      .filter(p => (p['コートネーム'] || p['選手名']) === selectedPlayerName && parseNum(p.MIN) > 0)
      .sort((a, b) => {
        const idxA = games.findIndex((g: any) => g.GameID === a.gameObj.GameID);
        const idxB = games.findIndex((g: any) => g.GameID === b.gameObj.GameID);
        return idxB - idxA;
      });
  }, [filteredPlayerGames, selectedPlayerName, games]);

  // Rankings
  const getRank = (statKey: string) => {
    const sorted = Object.values(teamAverages.averages).sort((a: any, b: any) => b[statKey] - a[statKey]);
    const idx = sorted.findIndex((p: any) => p.name === selectedPlayerName);
    return idx >= 0 ? idx + 1 : '-';
  };
  
  const getMax = (statKey: string) => {
    const sorted = Object.values(teamAverages.averages).sort((a: any, b: any) => b[statKey] - a[statKey]);
    return sorted.length > 0 ? (sorted[0] as any)[statKey] : 1;
  };

  const chartStats = [
    { label: '得点', key: 'PTS', color: '#f7e04f' },
    { label: 'アシスト', key: 'AST', color: '#b535f6' },
    { label: 'リバウンド', key: 'REB', color: '#f7e04f' },
    { label: 'スティール', key: 'STL', color: '#b535f6' },
    { label: 'ブロック', key: 'BLK', color: '#f7e04f' },
  ];

  // Trend Chart Data
  const trendData = [...selectedPlayerGames].reverse(); // oldest to newest for chart

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>選手個人スタッツ</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>選手を選んでシーズン成績・推移を確認</p>
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>選手</span>
          <select 
            style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '7px', padding: '8px 12px', outline: 'none', minWidth: '200px' }}
            value={selectedPlayerName} 
            onChange={e => setSelectedPlayerName(e.target.value)}
          >
            {uniquePlayers.map(p => (
              <option key={p.name} value={p.name}>#{p.jersey} {p.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>カテゴリー</span>
          <select 
            style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '7px', padding: '8px 12px', outline: 'none', minWidth: '160px' }}
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map((c: string) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 5 Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--accent)' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>平均得点</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '8px' }}>{formatNum(selectedPlayerAverages.PTS)}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>チーム avg {formatNum(teamAverages.teamAvgPts)}</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--accent2)' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>EFG%</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '8px' }}>{formatNum(selectedPlayerAverages.EFG)}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>FT% {formatNum(selectedPlayerAverages.FTP)}%</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--accent)' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>USG%</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '8px' }}>{formatNum(selectedPlayerAverages.USG)}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>使用率</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--accent2)' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>EFF</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '8px' }}>{formatNum(selectedPlayerAverages.EFF)}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>効率指標</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--accent)' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>+/- 平均</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '8px', color: selectedPlayerAverages.PM > 0 ? 'var(--accent)' : selectedPlayerAverages.PM < 0 ? 'var(--accent2)' : 'inherit' }}>
            {selectedPlayerAverages.PM > 0 ? '+' : ''}{formatNum(selectedPlayerAverages.PM)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>出場時得失点差</div>
        </div>
      </div>

      {/* Stats Comparison Chart */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>スタッツ比較（チーム内ランク）</div>
        <div className="glass-panel" style={{ padding: '32px 40px' }}>
          {chartStats.map((stat, i) => {
            const val = selectedPlayerAverages[stat.key] || 0;
            const max = getMax(stat.key) || 1; // avoid div by 0
            const pct = Math.min(100, Math.max(2, (val / max) * 100)); // min 2% to show some bar
            const rank = getRank(stat.key);
            
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: i === chartStats.length - 1 ? 0 : '24px' }}>
                <div style={{ width: '100px', fontSize: '13px', fontWeight: 600 }}>{stat.label}</div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '12px', borderRadius: '6px', overflow: 'hidden', margin: '0 20px', position: 'relative' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: stat.color, borderRadius: '6px' }} />
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontSize: '13px', fontFamily: 'var(--mono)', fontWeight: 700 }}>
                  {formatNum(val)}
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontSize: '12px', color: 'var(--muted)' }}>
                  {rank}位
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trend Chart */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>得点推移（試合ごと）</div>
        <div className="glass-panel" style={{ padding: '20px 20px 60px 20px', height: '260px', position: 'relative' }}>
          {trendData.length > 0 ? (
            <>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  {/* Y Axis Grid */}
                  {[0, 50, 100, 150, 200].map(p => (
                    <line key={p} x1="0" y1={p} x2="1000" y2={p} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  ))}
                  
                  <path
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="3"
                    d={lineToCubicBezier(trendData.map((d, i) => {
                      const maxPts = Math.max(...trendData.map((dd: any) => parseNum(dd.PTS)), 10);
                      const x = (i / Math.max(1, trendData.length - 1)) * 1000;
                      const y = 200 - (parseNum(d.PTS) / maxPts) * 200;
                      return [x, y] as [number, number];
                    }))}
                  />
                  
                  {trendData.map((d, i) => {
                    const maxPts = Math.max(...trendData.map((dd: any) => parseNum(dd.PTS)), 10);
                    const x = (i / Math.max(1, trendData.length - 1)) * 1000;
                    const y = 200 - (parseNum(d.PTS) / maxPts) * 200;
                    
                    return (
                      <circle key={i} cx={x} cy={y} r="6" fill="var(--accent)" stroke="var(--bg2)" strokeWidth="3" />
                    );
                  })}
                </svg>

                {/* HTML Labels for X Axis (avoids SVG text stretching) */}
                <div style={{ position: 'absolute', bottom: '-45px', left: '0', width: '100%', height: '40px' }}>
                  {trendData.map((d, i) => {
                    const xPct = (i / Math.max(1, trendData.length - 1)) * 100;
                    const rawDate = col(d.gameObj, 'date') || '';
                    const shortDate = rawDate.replace(/^\d{4}\//, ''); // remove year
                    const label = `${shortDate} ${col(d.gameObj, '対戦相手')}`;
                    
                    return (
                      <div 
                        key={i} 
                        style={{ 
                          position: 'absolute', 
                          left: `${xPct}%`, 
                          top: '0',
                          transform: 'translateX(-50%) rotate(-35deg)',
                          transformOrigin: 'top center',
                          fontSize: '10px',
                          color: 'var(--muted)',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none'
                        }}
                      >
                        {label.length > 14 ? label.substring(0, 14) + '...' : label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--muted)' }}>データがありません</div>
          )}
        </div>
      </div>

      {/* Game Log Table */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>試合別詳細</div>
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '10px 0' }}>
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px', fontFamily: 'var(--mono)' }}>
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)', fontSize: '11px' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'inherit' }}>日付</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'inherit' }}>対戦相手</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'inherit' }}>結果</th>
                <th style={{ padding: '12px 16px' }}>MIN</th>
                <th style={{ padding: '12px 16px' }}>PTS</th>
                <th style={{ padding: '12px 16px' }}>FGM/A</th>
                <th style={{ padding: '12px 16px' }}>3PM/A</th>
                <th style={{ padding: '12px 16px' }}>FTM/A</th>
                <th style={{ padding: '12px 16px' }}>OR</th>
                <th style={{ padding: '12px 16px' }}>DR</th>
                <th style={{ padding: '12px 16px' }}>AST</th>
                <th style={{ padding: '12px 16px' }}>TO</th>
                <th style={{ padding: '12px 16px' }}>STL</th>
                <th style={{ padding: '12px 16px' }}>EFF</th>
                <th style={{ padding: '12px 16px' }}>FP</th>
                <th style={{ padding: '12px 16px' }}>+/-</th>
              </tr>
            </thead>
            <tbody>
              {selectedPlayerGames.map((p, i) => {
                const ptsUs = parseNum(col(p.gameObj, 'team', 'pts') || col(p.gameObj, 'pts', 'us') || '0');
                const ptsOpp = parseNum(col(p.gameObj, 'opp', 'pts') || '0');
                const isWin = ptsUs > ptsOpp;
                
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)' }}>{col(p.gameObj, 'date')}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text)', fontFamily: '"Inter", sans-serif' }}>{col(p.gameObj, '対戦相手')}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'var(--mono)' }}>
                      <div style={{ display: 'inline-block', background: isWin ? 'rgba(247, 224, 79, 0.15)' : 'rgba(181, 53, 246, 0.15)', color: isWin ? 'var(--accent)' : 'var(--accent2)', border: `1px solid ${isWin ? 'var(--accent)' : 'var(--accent2)'}`, padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700 }}>
                        {isWin ? 'WIN' : 'LOSE'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.MIN || '0'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text)' }}>{p.PTS || '0'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.FGM || '0'}/{p.FGA || '0'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p['3PM'] || '0'}/{p['3PA'] || '0'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.FTM || '0'}/{p.FTA || '0'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.OR || '0'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.DR || '0'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.AST || '0'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.TO || '0'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.STL || '0'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accent2)' }}>{formatNum(p.EFF, 0)}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accent)' }}>{formatNum(p.FP, 1)}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: p.PlusMinus > 0 ? 'var(--accent)' : p.PlusMinus < 0 ? 'var(--accent2)' : 'var(--muted)' }}>
                      {p.PlusMinus > 0 ? `+${p.PlusMinus}` : p.PlusMinus}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}