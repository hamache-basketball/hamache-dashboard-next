'use client';

import React, { useState, useMemo } from 'react';
import { parseNum, formatNum, col, calcEFG, calcFP, calcEFF, calcUSG } from '@/lib/stats-logic';

export default function TeamClient({ initialData }: { initialData: any }) {
  const { games, players } = initialData;

  const [selectedCategory, setSelectedCategory] = useState<string>('全カテゴリー');

  // Helpers for 4 Factors
  const getGameFactor = (g: any, prefix: 'team' | 'opp', factor: string) => {
    const fga = parseNum(col(g, prefix, 'fga'));
    const fgm = parseNum(col(g, prefix, 'fgm'));
    const p3m = parseNum(col(g, prefix, '3pm'));
    const fta = parseNum(col(g, prefix, 'fta'));
    const to = parseNum(col(g, prefix, 'to'));
    const or = parseNum(col(g, prefix, 'or'));
    const oppPrefix = prefix === 'team' ? 'opp' : 'team';
    const oppDr = parseNum(col(g, oppPrefix, 'dr'));

    switch (factor) {
      case 'efg':
        return fga > 0 ? ((fgm + 0.5 * p3m) / fga) * 100 : 0;
      case 'to':
        const poss = fga + 0.44 * fta + to;
        return poss > 0 ? (to / poss) * 100 : 0;
      case 'or':
        return (or + oppDr) > 0 ? (or / (or + oppDr)) * 100 : 0;
      case 'ftr':
        return fga > 0 ? (fta / fga) * 100 : 0;
      default:
        return 0;
    }
  };

  // Categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    (games || []).forEach((g: any) => {
      const c = col(g, 'カテゴリー') || (g._rawRow && g._rawRow[34]) || g['_col_34'];
      if (c && typeof c === 'string' && c.trim() !== '') cats.add(c.trim());
    });
    return ['全カテゴリー', ...Array.from(cats)];
  }, [games]);

  // Filtered games (sorted old to new for trends, but we often need new to old)
  const filteredGamesAsc = useMemo(() => {
    return (games || [])
      .filter((g: any) => {
        const c = col(g, 'カテゴリー') || (g._rawRow && g._rawRow[34]) || g['_col_34'];
        return selectedCategory === '全カテゴリー' || (c && c.trim() === selectedCategory);
      })
      .sort((a: any, b: any) => new Date(col(a, 'date')).getTime() - new Date(col(b, 'date')).getTime());
  }, [games, selectedCategory]);

  const filteredGamesDesc = useMemo(() => [...filteredGamesAsc].reverse(), [filteredGamesAsc]);

  // Aggregate Team Stats
  const teamStats = useMemo(() => {
    let wins = 0, losses = 0;
    let pts = 0, oppPts = 0;
    let fgm = 0, fga = 0, oppFgm = 0, oppFga = 0;
    let to = 0, oppTo = 0;
    let or = 0, oppDr = 0, oppOr = 0, dr = 0;
    let poss = 0, oppPoss = 0;

    filteredGamesAsc.forEach((g: any) => {
      const p = parseNum(col(g, 'team', 'pts') || col(g, 'pts', 'us'));
      const op = parseNum(col(g, 'opp', 'pts'));
      if (p > op) wins++; else losses++;
      
      pts += p; oppPts += op;
      fgm += parseNum(col(g, 'team', 'fgm')); fga += parseNum(col(g, 'team', 'fga'));
      oppFgm += parseNum(col(g, 'opp', 'fgm')); oppFga += parseNum(col(g, 'opp', 'fga'));
      
      to += parseNum(col(g, 'team', 'to')); oppTo += parseNum(col(g, 'opp', 'to'));
      
      const teamOr = parseNum(col(g, 'team', 'or'));
      const teamDr = parseNum(col(g, 'team', 'dr'));
      const oOr = parseNum(col(g, 'opp', 'or'));
      const oDr = parseNum(col(g, 'opp', 'dr'));
      
      or += teamOr; dr += teamDr;
      oppOr += oOr; oppDr += oDr;
      
      const fta = parseNum(col(g, 'team', 'fta'));
      const oppFta = parseNum(col(g, 'opp', 'fta'));
      
      poss += (parseNum(col(g, 'team', 'fga')) + 0.44 * fta + parseNum(col(g, 'team', 'to')));
      oppPoss += (oppFga + 0.44 * oppFta + oppTo);
    });

    const total = wins + losses;
    return {
      total, wins, losses,
      winPct: total > 0 ? (wins / total) * 100 : 0,
      ptsAvg: total > 0 ? pts / total : 0,
      oppPtsAvg: total > 0 ? oppPts / total : 0,
      fgPct: fga > 0 ? (fgm / fga) * 100 : 0,
      oppFgPct: oppFga > 0 ? (oppFgm / oppFga) * 100 : 0,
      toAvg: total > 0 ? to / total : 0,
      oppToAvg: total > 0 ? oppTo / total : 0,
      orPct: (or + oppDr) > 0 ? (or / (or + oppDr)) * 100 : 0,
      oppOrPct: (oppOr + dr) > 0 ? (oppOr / (oppOr + dr)) * 100 : 0,
      ppp: poss > 0 ? pts / poss : 0,
      oppPpp: oppPoss > 0 ? oppPts / oppPoss : 0
    };
  }, [filteredGamesAsc]);

  // Aggregate Players for Ranking
  const playerRankings = useMemo(() => {
    // 1. Group player data per game first to handle +/- correctly (from PlayerClient)
    const pMap = new Map<string, any>();
    (players || []).forEach((p: any) => {
      const game = filteredGamesAsc.find((g: any) => g.GameID === p.GameID);
      if (!game) return; // ignore games not in category
      
      const name = p['コートネーム'] || p['選手名'] || 'Unknown';
      if (!pMap.has(name)) {
        pMap.set(name, {
          name, jersey: (p._rawRow && p._rawRow[3]) || p['背番号'] || '-',
          games: 0, pts: 0, min: 0, fga: 0, fgm: 0, p3a: 0, p3m: 0, fta: 0, ftm: 0,
          or: 0, dr: 0, ast: 0, stl: 0, blk: 0, to: 0, pm: 0,
          teamPoss: 0, usgSum: 0, effSum: 0, fpSum: 0
        });
      }
      
      const exist = pMap.get(name);
      
      // Calculate per-game values for this player
      // Since players array might have multiple rows per game (per period), we need to group by game first, 
      // but to keep it simple, we can just sum everything up and divide by games.
      // Wait, MIN could be per period. 
      // It's better to calculate the player's total stats across all filtered games directly.
      
      exist.pts += parseNum(p.PTS);
      exist.min += parseNum(p.MIN);
      exist.fga += parseNum(p.FGA);
      exist.fgm += parseNum(p.FGM);
      exist.p3a += parseNum(p['3PA']);
      exist.p3m += parseNum(p['3PM']);
      exist.fta += parseNum(p.FTA);
      exist.ftm += parseNum(p.FTM);
      exist.or += parseNum(p.OR);
      exist.dr += parseNum(p.DR);
      exist.ast += parseNum(p.AST);
      exist.stl += parseNum(p.STL);
      exist.blk += parseNum(p.BLK);
      exist.to += parseNum(p.TO);
      
      const pm = (p._rawRow && p._rawRow[27]) || p['AB'] || p['+/-'] || p['PlusMinus'];
      exist.pm += parseNum(pm);
      
      // We will count games later by checking unique GameIDs per player.
    });

    // Count games and calculate advanced stats
    const uniqueGamesPerPlayer = new Map<string, Set<string>>();
    (players || []).forEach((p: any) => {
      const game = filteredGamesAsc.find((g: any) => g.GameID === p.GameID);
      if (!game) return;
      const name = p['コートネーム'] || p['選手名'] || 'Unknown';
      if (parseNum(p.MIN) > 0) {
        if (!uniqueGamesPerPlayer.has(name)) uniqueGamesPerPlayer.set(name, new Set());
        uniqueGamesPerPlayer.get(name)!.add(p.GameID);
      }
    });

    // Calculate Team Totals across filtered games
    let totalTeamMin = 0;
    let totalTeamPoss = 0;
    filteredGamesAsc.forEach((g: any) => {
      totalTeamMin += parseNum(col(g, 'team', 'min')) || 200;
      totalTeamPoss += parseNum(col(g, 'team', 'fga')) + 0.44 * parseNum(col(g, 'team', 'fta')) + parseNum(col(g, 'team', 'to'));
    });

    const rankings: any[] = [];
    for (const [name, d] of Array.from(pMap.entries())) {
      const gCount = uniqueGamesPerPlayer.get(name)?.size || 0;
      if (gCount === 0) continue;

      const ptsAvg = d.pts / gCount;
      const fgPct = d.fga > 0 ? (d.fgm / d.fga) * 100 : 0;
      const efg = calcEFG(d.fgm, d.p3m, d.fga);
      const ftp = d.fta > 0 ? (d.ftm / d.fta) * 100 : 0;
      const poss = d.fga + 0.44 * d.fta + d.to;
      const ppp = poss > 0 ? d.pts / poss : 0;
      
      // Net Rating approx
      // estimated possessions player was on court across the season
      const estPlayerPoss = totalTeamPoss * (d.min / (totalTeamMin > 0 ? Math.max(totalTeamMin / 5, 1) : 200));
      const netRating = estPlayerPoss > 0 ? (d.pm / estPlayerPoss) * 100 : 0;
      
      // FP / EFF per game
      const fp = calcFP(d.pts, d.or, d.dr, d.ast, d.stl, d.blk, d.to);
      const eff = calcEFF(d.pts, d.or + d.dr, d.ast, d.stl, d.blk, d.fga, d.fgm, d.fta, d.ftm, d.to);
      
      // USG% approx across season
      let usg = 0;
      let myTotalTeamMinForUsg = 0;
      let myTotalTeamFgaForUsg = 0;
      let myTotalTeamFtaForUsg = 0;
      let myTotalTeamToForUsg = 0;
      uniqueGamesPerPlayer.get(name)?.forEach(gid => {
        const game = filteredGamesAsc.find((g: any) => g.GameID === gid);
        if (game) {
          myTotalTeamMinForUsg += parseNum(col(game, 'team', 'min')) || 200;
          myTotalTeamFgaForUsg += parseNum(col(game, 'team', 'fga'));
          myTotalTeamFtaForUsg += parseNum(col(game, 'team', 'fta'));
          myTotalTeamToForUsg += parseNum(col(game, 'team', 'to'));
        }
      });
      if (d.min > 0) {
        usg = calcUSG(d.fga, d.fta, d.to, d.min, myTotalTeamMinForUsg, myTotalTeamFgaForUsg, myTotalTeamFtaForUsg, myTotalTeamToForUsg);
      }

      rankings.push({
        name, jersey: d.jersey, games: gCount,
        ptsAvg, fgPct, efg, ftp, ppp, netRating,
        fpAvg: fp / gCount, effAvg: eff / gCount, usg
      });
    }

    return rankings.sort((a, b) => b.ptsAvg - a.ptsAvg);
  }, [players, filteredGamesAsc]);

  // Win/Loss Analysis
  const wlAnalysis = useMemo(() => {
    const wins = filteredGamesAsc.filter((g: any) => parseNum(col(g, 'team', 'pts') || col(g, 'pts', 'us')) > parseNum(col(g, 'opp', 'pts')));
    const losses = filteredGamesAsc.filter((g: any) => parseNum(col(g, 'team', 'pts') || col(g, 'pts', 'us')) < parseNum(col(g, 'opp', 'pts')));

    const avgFactor = (gamesArr: any[], statKey: string) => {
      if (gamesArr.length === 0) return 0;
      const sum = gamesArr.reduce((acc, g) => acc + getGameFactor(g, 'team', statKey), 0);
      return sum / gamesArr.length;
    };
    
    const avgPts = (gamesArr: any[], prefix: 'team' | 'opp') => {
      if (gamesArr.length === 0) return 0;
      const sum = gamesArr.reduce((acc, g) => acc + parseNum(col(g, prefix, 'pts') || (prefix === 'team' ? col(g, 'pts', 'us') : 0)), 0);
      return sum / gamesArr.length;
    };
    
    const avgPpp = (gamesArr: any[]) => {
      if (gamesArr.length === 0) return 0;
      let p = 0, poss = 0;
      gamesArr.forEach(g => {
        p += parseNum(col(g, 'team', 'pts') || col(g, 'pts', 'us'));
        poss += parseNum(col(g, 'team', 'fga')) + 0.44 * parseNum(col(g, 'team', 'fta')) + parseNum(col(g, 'team', 'to'));
      });
      return poss > 0 ? p / poss : 0;
    };

    return {
      winCount: wins.length,
      lossCount: losses.length,
      win: {
        efg: avgFactor(wins, 'efg'), to: avgFactor(wins, 'to'), or: avgFactor(wins, 'or'), ftr: avgFactor(wins, 'ftr'),
        pts: avgPts(wins, 'team'), oppPts: avgPts(wins, 'opp'), ppp: avgPpp(wins)
      },
      loss: {
        efg: avgFactor(losses, 'efg'), to: avgFactor(losses, 'to'), or: avgFactor(losses, 'or'), ftr: avgFactor(losses, 'ftr'),
        pts: avgPts(losses, 'team'), oppPts: avgPts(losses, 'opp'), ppp: avgPpp(losses)
      }
    };
  }, [filteredGamesAsc]);

  // Boundaries & Comments
  const boundaries = useMemo(() => {
    if (filteredGamesAsc.length === 0) return null;
    
    const getMedian = (arr: number[]) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const stats = ['efg', 'to', 'or', 'ftr'].map(key => {
      const vals = filteredGamesAsc.map((g: any) => getGameFactor(g, 'team', key));
      const median = getMedian(vals);
      
      let aboveWins = 0, aboveTotal = 0;
      let belowWins = 0, belowTotal = 0;
      
      filteredGamesAsc.forEach((g: any) => {
        const val = getGameFactor(g, 'team', key);
        const isWin = parseNum(col(g, 'team', 'pts') || col(g, 'pts', 'us')) > parseNum(col(g, 'opp', 'pts'));
        // For TO%, lower is better, so "above baseline" means better (lower TO%). Wait, let's just do mathematical > median
        if (val > median) {
          aboveTotal++;
          if (isWin) aboveWins++;
        } else {
          belowTotal++;
          if (isWin) belowWins++;
        }
      });

      const aboveWinPct = aboveTotal > 0 ? (aboveWins / aboveTotal) * 100 : 0;
      const belowWinPct = belowTotal > 0 ? (belowWins / belowTotal) * 100 : 0;
      
      // "Better" win pct means win pct when the stat is in the good direction.
      // eFG, OR, FTR -> higher is better. TO -> lower is better.
      const isGoodAbove = key !== 'to';
      const goodWinPct = isGoodAbove ? aboveWinPct : belowWinPct;
      const badWinPct = isGoodAbove ? belowWinPct : aboveWinPct;
      const gap = goodWinPct - badWinPct;
      
      return { key, median, goodWinPct, badWinPct, gap, isGoodAbove };
    });

    const best = [...stats].sort((a, b) => b.gap - a.gap)[0];

    return { stats, best };
  }, [filteredGamesAsc]);

  // UI rendering helpers
  const statLabels: Record<string, string> = { efg: 'eFG%', to: 'TO%', or: 'OR%', ftr: 'FTR' };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>チーム全体</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>シーズン通算の成績と傾向</p>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>カテゴリー</span>
        <select 
          style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '7px', padding: '8px 12px', outline: 'none', minWidth: '200px' }}
          value={selectedCategory} 
          onChange={e => setSelectedCategory(e.target.value)}
        >
          {categories.map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--accent)' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>勝敗</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '8px' }}>{teamStats.wins}-{teamStats.losses}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>勝率 {formatNum(teamStats.winPct)}%</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--accent2)' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>平均得点</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '8px' }}>{formatNum(teamStats.ptsAvg)}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>失点 avg {formatNum(teamStats.oppPtsAvg)}</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid #38d9a9' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>チームFG%</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '8px' }}>{formatNum(teamStats.fgPct)}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>相手 avg {formatNum(teamStats.oppFgPct)}%</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--lose)' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>平均TO</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '8px' }}>{formatNum(teamStats.toAvg)}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>相手 avg {formatNum(teamStats.oppToAvg)}</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid #f7a84f' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>平均OR%</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '8px' }}>{formatNum(teamStats.orPct)}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>相手 avg {formatNum(teamStats.oppOrPct)}%</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid #4f8ef7' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>平均PPP</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '8px' }}>{formatNum(teamStats.ppp, 2)}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>相手 avg {formatNum(teamStats.oppPpp, 2)}</div>
        </div>
      </div>

      {/* Ranking */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>得点ランキング（シーズン平均）</div>
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '10px 0' }}>
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px', fontFamily: 'var(--mono)' }}>
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)', fontSize: '11px' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'inherit' }}>順位</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'inherit' }}>選手</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'inherit' }}>試合数</th>
                <th style={{ padding: '12px 16px' }}>PTS</th>
                <th style={{ padding: '12px 16px' }}>FG%</th>
                <th style={{ padding: '12px 16px' }}>EFG%</th>
                <th style={{ padding: '12px 16px' }}>FT%</th>
                <th style={{ padding: '12px 16px' }}>PPP</th>
                <th style={{ padding: '12px 16px' }}>NET RATING</th>
                <th style={{ padding: '12px 16px' }}>FP</th>
                <th style={{ padding: '12px 16px' }}>EFF</th>
                <th style={{ padding: '12px 16px' }}>USG%</th>
              </tr>
            </thead>
            <tbody>
              {playerRankings.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'left' }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'left', color: '#4f8ef7', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>#{p.jersey} <span style={{ textDecoration: 'underline' }}>{p.name}</span></td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{p.games}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text)' }}>{formatNum(p.ptsAvg)}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{formatNum(p.fgPct)}%</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{formatNum(p.efg)}%</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{formatNum(p.ftp)}%</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{formatNum(p.ppp, 2)}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: p.netRating > 0 ? 'var(--accent2)' : p.netRating < 0 ? 'var(--lose)' : 'var(--muted)' }}>
                    {p.netRating > 0 ? '+' : ''}{formatNum(p.netRating)}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f7a84f' }}>{formatNum(p.fpAvg)}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#4f8ef7' }}>{formatNum(p.effAvg)}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#e8c35d' }}>{formatNum(p.usg)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px', paddingLeft: '8px' }}>
          ※ Net Rating = 出場中の得失点差 ÷ 推定チームポゼッション × 100 (100ポゼッションあたりの得失点差)
        </div>
      </div>

      {/* Points Bar Chart */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>得点・失点推移（全試合）</div>
        <div className="glass-panel" style={{ padding: '20px 20px 60px 20px', height: '300px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <div style={{ width: '12px', height: '12px', background: '#4f8ef7', borderRadius: '2px' }}></div> チーム得点
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <div style={{ width: '12px', height: '12px', background: 'rgba(240, 111, 111, 0.7)', borderRadius: '2px' }}></div> 失点
            </div>
          </div>
          
          <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 30px)' }}>
            <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              {[0, 50, 100, 150, 200].map(p => (
                <line key={p} x1="0" y1={p} x2="1000" y2={p} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              ))}
              
              {filteredGamesAsc.map((g: any, i: number) => {
                const maxPts = Math.max(...filteredGamesAsc.map((dd: any) => Math.max(parseNum(col(dd, 'team', 'pts') || col(dd, 'pts', 'us')), parseNum(col(dd, 'opp', 'pts')))), 10) * 1.1;
                const xPct = (i / Math.max(1, filteredGamesAsc.length)) * 1000;
                const barWidth = Math.min(1000 / filteredGamesAsc.length * 0.35, 20);
                
                const pts = parseNum(col(g, 'team', 'pts') || col(g, 'pts', 'us'));
                const oppPts = parseNum(col(g, 'opp', 'pts'));
                const ptsH = (pts / maxPts) * 200;
                const oppH = (oppPts / maxPts) * 200;
                
                return (
                  <g key={i}>
                    <rect x={xPct + barWidth*0.5} y={200 - ptsH} width={barWidth} height={ptsH} fill="#4f8ef7" rx="2" />
                    <rect x={xPct + barWidth*1.7} y={200 - oppH} width={barWidth} height={oppH} fill="rgba(240, 111, 111, 0.7)" rx="2" />
                  </g>
                );
              })}
            </svg>

            <div style={{ position: 'absolute', bottom: '-45px', left: '0', width: '100%', height: '40px' }}>
              {filteredGamesAsc.map((g: any, i: number) => {
                const xPct = (i / Math.max(1, filteredGamesAsc.length)) * 100;
                const label = `${col(g, 'date')?.replace(/^\d{4}\//, '')} ${col(g, '対戦相手')}`;
                return (
                  <div key={i} style={{ 
                    position: 'absolute', left: `${xPct + 1.5}%`, top: '0',
                    transform: 'translateX(-50%) rotate(-35deg)', transformOrigin: 'top center',
                    fontSize: '9px', color: 'var(--muted)', whiteSpace: 'nowrap'
                  }}>
                    {label.length > 12 ? label.substring(0, 12) + '...' : label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Win/Loss Analysis */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>勝敗分析 — 勝利・敗戦の傾向と課題</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '20px' }}>勝利試合 ({wlAnalysis.winCount}) VS 敗戦試合 ({wlAnalysis.lossCount}) - 4 FACTORS平均比較</div>
            
            {['efg', 'to', 'or', 'ftr'].map((k: string) => {
              const valW = (wlAnalysis.win as any)[k];
              const valL = (wlAnalysis.loss as any)[k];
              const diff = valW - valL;
              const max = Math.max(valW, valL, 1) * 1.2;
              
              return (
                <div key={k} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', alignItems: 'center' }}>
                    <div style={{ width: '40px' }}>{statLabels[k]}</div>
                    <div style={{ width: '20px' }}>勝</div>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', position: 'relative' }}>
                      <div style={{ width: `${(valW / max) * 100}%`, height: '100%', background: '#38d9a9', borderRadius: '3px' }}></div>
                    </div>
                    <div style={{ width: '40px', textAlign: 'right', fontWeight: 700, color: '#38d9a9' }}>{formatNum(valW)}%</div>
                    <div style={{ width: '40px', textAlign: 'right', fontWeight: 700, color: diff > 0 ? '#38d9a9' : diff < 0 ? 'var(--lose)' : 'var(--muted)' }}>
                      {diff > 0 ? '+' : ''}{formatNum(diff)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', fontSize: '11px', color: 'var(--muted)', alignItems: 'center' }}>
                    <div style={{ width: '40px' }}></div>
                    <div style={{ width: '20px' }}>敗</div>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', position: 'relative' }}>
                      <div style={{ width: `${(valL / max) * 100}%`, height: '100%', background: 'rgba(240, 111, 111, 0.7)', borderRadius: '3px' }}></div>
                    </div>
                    <div style={{ width: '40px', textAlign: 'right', fontWeight: 700, color: 'rgba(240, 111, 111, 0.7)' }}>{formatNum(valL)}%</div>
                    <div style={{ width: '40px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '20px' }}>勝利 ({wlAnalysis.winCount}試合) VS 敗戦 ({wlAnalysis.lossCount}試合) - 得点・失点比較</div>
            
            {['pts', 'oppPts', 'ppp'].map((k: string) => {
              const valW = (wlAnalysis.win as any)[k];
              const valL = (wlAnalysis.loss as any)[k];
              const max = Math.max(valW, valL, 1) * 1.2;
              const label = k === 'pts' ? '平均得点' : k === 'oppPts' ? '平均失点' : '平均PPP';
              const isPpp = k === 'ppp';
              
              return (
                <div key={k} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', alignItems: 'center' }}>
                    <div style={{ width: '60px' }}>{label}</div>
                    <div style={{ width: '20px' }}>勝</div>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', position: 'relative' }}>
                      <div style={{ width: `${(valW / max) * 100}%`, height: '100%', background: '#38d9a9', borderRadius: '3px' }}></div>
                    </div>
                    <div style={{ width: '40px', textAlign: 'right', fontWeight: 700, color: '#38d9a9' }}>{formatNum(valW, isPpp ? 2 : 1)}</div>
                  </div>
                  <div style={{ display: 'flex', fontSize: '11px', color: 'var(--muted)', alignItems: 'center' }}>
                    <div style={{ width: '60px' }}></div>
                    <div style={{ width: '20px' }}>敗</div>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', position: 'relative' }}>
                      <div style={{ width: `${(valL / max) * 100}%`, height: '100%', background: 'rgba(240, 111, 111, 0.7)', borderRadius: '3px' }}></div>
                    </div>
                    <div style={{ width: '40px', textAlign: 'right', fontWeight: 700, color: 'rgba(240, 111, 111, 0.7)' }}>{formatNum(valL, isPpp ? 2 : 1)}</div>
                  </div>
                </div>
              );
            })}
            
            <div style={{ marginTop: '30px', fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>
              勝利試合の平均得失点差: <span style={{ color: '#38d9a9', fontWeight: 700 }}>+{formatNum(wlAnalysis.win.pts - wlAnalysis.win.oppPts)}</span> 
              <span style={{ margin: '0 10px' }}></span> 
              敗戦: <span style={{ color: 'var(--lose)', fontWeight: 700 }}>{formatNum(wlAnalysis.loss.pts - wlAnalysis.loss.oppPts)}</span>
            </div>
          </div>
        </div>

        {/* Boundary Analysis */}
        {boundaries && (
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '20px' }}>勝敗の境界線（中央値を基準）</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {boundaries.stats.map(b => (
                <div key={b.key}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{statLabels[b.key]}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>基準値: {formatNum(b.median)}%</div>
                  <div style={{ fontSize: '12px', color: b.isGoodAbove ? '#38d9a9' : 'var(--lose)' }}>上回った時の勝率 {formatNum(b.isGoodAbove ? b.goodWinPct : b.badWinPct)}%</div>
                  <div style={{ fontSize: '12px', color: !b.isGoodAbove ? '#38d9a9' : 'var(--lose)' }}>下回った時の勝率 {formatNum(!b.isGoodAbove ? b.goodWinPct : b.badWinPct)}%</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px', background: 'rgba(56, 217, 169, 0.05)', borderLeft: '3px solid #38d9a9', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>🔍</span> 分析コメント
              </div>
              <ul style={{ fontSize: '13px', margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
                <li style={{ marginBottom: '4px' }}>
                  最も勝敗に影響している指標は <strong style={{ color: 'var(--text)' }}>{statLabels[boundaries.best.key]}</strong> です。基準値 ({formatNum(boundaries.best.median)}%) を{boundaries.best.isGoodAbove ? '上回った' : '下回った'}試合の勝率は <strong style={{ color: '#38d9a9' }}>{formatNum(boundaries.best.goodWinPct)}%</strong>、{boundaries.best.isGoodAbove ? '下回った' : '上回った'}試合は <strong style={{ color: 'var(--lose)' }}>{formatNum(boundaries.best.badWinPct)}%</strong> です。
                </li>
                <li>
                  勝利試合の {statLabels[boundaries.best.key]} は敗戦時より {formatNum(Math.abs((wlAnalysis.win as any)[boundaries.best.key] - (wlAnalysis.loss as any)[boundaries.best.key]))}% {boundaries.best.isGoodAbove ? '高く' : '低く'}、この数値の改善が勝敗に直結しています。
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 4 FACTORS Trends */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>4 FACTORS 試合別推移</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          {['efg', 'to', 'or', 'ftr'].map((k: string) => {
            const isGoodUp = k !== 'to';
            
            return (
              <div key={k} className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>
                    {statLabels[k]} <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 400, marginLeft: '8px' }}>{isGoodUp ? '高いほど良' : '低いほど良'}</span>
                  </div>
                </div>
                
                <div style={{ height: '180px', position: 'relative' }}>
                  <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    {[0, 50, 100, 150, 200].map(p => (
                      <line key={p} x1="0" y1={p} x2="1000" y2={p} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    ))}
                    
                    <polyline
                      fill="none" stroke="#4f8ef7" strokeWidth="2"
                      points={filteredGamesAsc.map((g: any, i: number) => {
                        const val = getGameFactor(g, 'team', k);
                        const max = k === 'efg' || k === 'or' ? 80 : 80; // Scale 0-80% for aesthetics
                        return `${(i / Math.max(1, filteredGamesAsc.length - 1)) * 1000},${200 - (Math.min(val, max) / max) * 200}`;
                      }).join(' ')}
                    />
                    {filteredGamesAsc.map((g: any, i: number) => {
                      const val = getGameFactor(g, 'team', k);
                      const max = 80;
                      return <circle key={i} cx={(i / Math.max(1, filteredGamesAsc.length - 1)) * 1000} cy={200 - (Math.min(val, max) / max) * 200} r="4" fill="#4f8ef7" />;
                    })}

                    <polyline
                      fill="none" stroke="rgba(240, 111, 111, 0.7)" strokeWidth="2"
                      points={filteredGamesAsc.map((g: any, i: number) => {
                        const val = getGameFactor(g, 'opp', k);
                        const max = 80;
                        return `${(i / Math.max(1, filteredGamesAsc.length - 1)) * 1000},${200 - (Math.min(val, max) / max) * 200}`;
                      }).join(' ')}
                    />
                    {filteredGamesAsc.map((g: any, i: number) => {
                      const val = getGameFactor(g, 'opp', k);
                      const max = 80;
                      return <circle key={i} cx={(i / Math.max(1, filteredGamesAsc.length - 1)) * 1000} cy={200 - (Math.min(val, max) / max) * 200} r="4" fill="rgba(240, 111, 111, 0.7)" />;
                    })}

                    {/* Trend line (5 game MA) */}
                    <polyline
                      fill="none" stroke="#4f8ef7" strokeWidth="2" strokeDasharray="5,5"
                      points={filteredGamesAsc.map((g: any, i: number) => {
                        let sum = 0; let count = 0;
                        for (let j = Math.max(0, i - 4); j <= i; j++) {
                          sum += getGameFactor(filteredGamesAsc[j], 'team', k);
                          count++;
                        }
                        const val = sum / count;
                        const max = 80;
                        return `${(i / Math.max(1, filteredGamesAsc.length - 1)) * 1000},${200 - (Math.min(val, max) / max) * 200}`;
                      }).join(' ')}
                    />
                  </svg>
                  
                  {/* Legend overlay inside chart area */}
                  <div style={{ position: 'absolute', top: '-10px', left: '0', display: 'flex', gap: '16px', fontSize: '10px', color: 'var(--muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '2px', background: '#4f8ef7' }}></div> 自チーム</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '2px', background: 'rgba(240, 111, 111, 0.7)' }}></div> 相手</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '2px', background: '#4f8ef7', borderBottom: '2px dashed #4f8ef7' }}></div> トレンド</div>
                  </div>

                  {/* Y Axis labels */}
                  <div style={{ position: 'absolute', left: '10px', top: '0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '9px', color: 'var(--muted)', pointerEvents: 'none' }}>
                    <span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span>
                  </div>

                  <div style={{ position: 'absolute', bottom: '-30px', left: '0', width: '100%', height: '20px' }}>
                    {filteredGamesAsc.map((g: any, i: number) => {
                      if (i % Math.ceil(filteredGamesAsc.length / 8) !== 0 && i !== filteredGamesAsc.length - 1) return null;
                      const xPct = (i / Math.max(1, filteredGamesAsc.length - 1)) * 100;
                      const label = `${col(g, 'date')?.replace(/^\d{4}\//, '')}_${col(g, '対戦相手')}`;
                      return <div key={i} style={{ position: 'absolute', left: `${xPct}%`, top: '0', transform: 'translateX(-50%) rotate(-25deg)', transformOrigin: 'top center', fontSize: '9px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{label.length > 10 ? label.substring(0, 10) + '...' : label}</div>;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
