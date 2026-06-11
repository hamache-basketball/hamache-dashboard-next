'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { calcFP, parseNum, formatNum, col } from '@/lib/stats-logic';
import { useGlobalState } from '@/lib/GlobalStateProvider';

export default function HomeClient({ initialData }: { initialData: any }) {
  const { games, players } = initialData;
  const router = useRouter();
  const { setGlobalGameId } = useGlobalState();

  const sortedGames = useMemo(() => {
    return [...(games || [])].reverse();
  }, [games]);

  // Season Summary
  const seasonSummary = useMemo(() => {
    if (!sortedGames.length) return { wins: 0, losses: 0, draws: 0, ppp: 0, pace: 0, winRate: 0 };
    
    let w = 0, l = 0, d = 0;
    let totalPpp = 0;
    let totalPace = 0;
    let validPppGames = 0;

    sortedGames.forEach((g: any) => {
      const res = col(g, '勝敗');
      if (res && res.toUpperCase() === 'WIN') w++;
      else if (res && res.toUpperCase() === 'LOSE') l++;
      else d++;

      const ppp = parseNum(col(g, 'team', 'ppp'));
      if (ppp > 0) {
        totalPpp += ppp;
        validPppGames++;
      }
      totalPace += parseNum(col(g, 'pace'));
    });

    const winRate = (w + l) > 0 ? (w / (w + l)) * 100 : 0;
    const avgPpp = validPppGames > 0 ? totalPpp / validPppGames : 0;
    const avgPace = totalPace / sortedGames.length;

    return { wins: w, losses: l, draws: d, ppp: avgPpp, pace: avgPace, winRate };
  }, [sortedGames]);

  // Latest Game and MVP
  const latestGame = sortedGames[0];
  const mvp = useMemo(() => {
    if (!latestGame || !players) return null;
    
    const gameId = latestGame.GameID;
    const gamePlayers = players.filter((p: any) => p.GameID === gameId);
    
    let maxFp = -999;
    let mvpPlayer: any = null;

    gamePlayers.forEach((p: any) => {
      const fp = calcFP(p.PTS, p.OR, p.DR, p.AST, p.STL, p.BLK, p.TO);
      if (fp > maxFp) {
        maxFp = fp;
        mvpPlayer = { ...p, FP: fp };
      }
    });

    return mvpPlayer;
  }, [latestGame, players]);

  const handleNavigate = (path: string, gameId?: string) => {
    if (gameId) {
      setGlobalGameId(gameId);
    }
    router.push(path);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* 1. Season Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '120px', color: 'rgba(255,255,255,0.02)', fontWeight: 800, lineHeight: 1 }}>{sortedGames.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Season Record</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
              {seasonSummary.wins}
              <span style={{ fontSize: '16px', color: 'var(--muted)', fontWeight: 400 }}>W</span>
            </span>
            <span style={{ fontSize: '24px', color: 'var(--border2)' }}>-</span>
            <span style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
              {seasonSummary.losses}
              <span style={{ fontSize: '16px', color: 'var(--muted)', fontWeight: 400 }}>L</span>
            </span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--accent2)', fontWeight: 600, marginTop: '4px' }}>
            Win Rate: {formatNum(seasonSummary.winRate, 1)}%
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Team Avg PPP</div>
          <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>
            {formatNum(seasonSummary.ppp, 2)}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            Points Per Possession
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Team Avg PACE</div>
          <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--mono)', color: '#f0d34f' }}>
            {formatNum(seasonSummary.pace, 1)}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            Possessions per 40 min
          </div>
        </div>
      </div>

      {/* 2. Latest Game */}
      {latestGame && (
        <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Latest Game Recap</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{col(latestGame, 'date')}</div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {/* Score section */}
            <div style={{ flex: '1 1 300px', padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>
                vs <span style={{ color: 'var(--text)', fontWeight: 600 }}>{col(latestGame, '対戦相手')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--accent)', lineHeight: 1 }}>{col(latestGame, 'team', 'pts') || col(latestGame, 'pts', 'us')}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>TEAM</div>
                </div>
                <div style={{ fontSize: '24px', color: 'var(--border2)' }}>-</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--muted)', lineHeight: 1 }}>{col(latestGame, 'opp', 'pts')}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>OPP</div>
                </div>
              </div>
              <div style={{ marginTop: '24px' }}>
                <button 
                  onClick={() => handleNavigate('/report', latestGame.GameID)}
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--mono)' }}
                >
                  View Game Report →
                </button>
              </div>
            </div>

            {/* MVP section */}
            {mvp && (
              <div style={{ flex: '1 1 300px', padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'radial-gradient(circle at top right, rgba(247, 168, 79, 0.05), transparent)' }}>
                <div style={{ fontSize: '12px', color: '#f7a84f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>👑</span> Game MVP
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '20px', marginRight: '8px', fontFamily: 'var(--mono)' }}>#{mvp['背番号']}</span>
                  {mvp['コートネーム'] || mvp['選手名']}
                </div>
                
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--mono)', color: '#f7a84f' }}>{formatNum(mvp.FP, 1)}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>FP</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{mvp.PTS}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>PTS</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{(parseNum(mvp.OR) + parseNum(mvp.DR))}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>REB</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{mvp.AST}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>AST</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Quick Access Portal */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Quick Access</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          
          <div 
            onClick={() => handleNavigate('/report')}
            className="glass-panel" 
            style={{ padding: '24px', cursor: 'pointer', borderTop: '2px solid var(--accent)', transition: 'transform 0.2s, background 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--bg2)'; }}
          >
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>📊</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>試合レポート</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>モメンタム推移、Sankeyフロー図、貢献度散布図による視覚的分析</div>
          </div>

          <div 
            onClick={() => handleNavigate('/game')}
            className="glass-panel" 
            style={{ padding: '24px', cursor: 'pointer', borderTop: '2px solid #4f8ef7', transition: 'transform 0.2s, background 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--bg2)'; }}
          >
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>📋</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>試合分析 (Box Score)</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>試合単位の基本スタッツ一覧とEFF、USG%などのアドバンスド指標</div>
          </div>

          <div 
            onClick={() => handleNavigate('/player')}
            className="glass-panel" 
            style={{ padding: '24px', cursor: 'pointer', borderTop: '2px solid #f7a84f', transition: 'transform 0.2s, background 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--bg2)'; }}
          >
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🏃</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>選手個人スタッツ</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>シーズンを通した各選手の平均スタッツとチーム内ランキング</div>
          </div>

          <div 
            onClick={() => handleNavigate('/lineup')}
            className="glass-panel" 
            style={{ padding: '24px', cursor: 'pointer', borderTop: '2px solid #a855f7', transition: 'transform 0.2s, background 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--bg2)'; }}
          >
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>👥</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>ラインナップ</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>5人組組み合わせ毎の+/-（得失点差）と出場時間の分析</div>
          </div>

        </div>
      </div>

    </div>
  );
}
