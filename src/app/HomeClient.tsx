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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0,240,255,0.1)', border: '1px solid var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-cyan)', fontSize: '20px', filter: 'drop-shadow(0 0 5px rgba(0,240,255,0.5))' }}>
            🏀
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.1em' }}>BASKETBALL ANALYTICS</span>
            <span style={{ color: 'var(--border2)' }}>|</span>
            <span style={{ fontSize: '16px', color: 'var(--muted)', letterSpacing: '0.05em' }}>SEASON DASHBOARD</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '8px 20px', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--muted)' }}></div>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Coach</span>
          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>▼</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid-sidebar-layout">
        
        {/* LEFT COLUMN: EXECUTIVE SUMMARY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.1em' }}>EXECUTIVE SUMMARY</div>
          
          {/* Row 1: Season Record & PPP */}
          <div className="grid-2col-responsive-uneven">
            {/* Season Record */}
            <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Season Record</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span className="mobile-text-huge" style={{ fontSize: '80px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--neon-cyan)', textShadow: '0 0 24px rgba(0,240,255,0.5)', lineHeight: 1 }}>
                  {seasonSummary.wins}
                </span>
                <span style={{ fontSize: '18px', color: 'var(--muted)' }}>WINS</span>
                <span style={{ fontSize: '40px', color: 'var(--border2)' }}>|</span>
                <span className="mobile-text-huge" style={{ fontSize: '80px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--neon-orange)', textShadow: '0 0 24px rgba(255,123,0,0.5)', lineHeight: 1 }}>
                  {seasonSummary.losses}
                </span>
                <span style={{ fontSize: '18px', color: 'var(--muted)' }}>LOSSES</span>
              </div>
              <div style={{ fontSize: '13px', background: 'rgba(255,255,255,0.05)', display: 'inline-block', padding: '6px 16px', borderRadius: '6px', alignSelf: 'flex-start' }}>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{formatNum(seasonSummary.winRate, 1)}%</span> <span style={{ color: 'var(--muted)' }}>WIN RATE</span>
              </div>
            </div>

            {/* Team PPP */}
            <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Team PPP</div>
              <div className="mobile-text-huge" style={{ fontSize: '80px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--neon-orange)', textShadow: '0 0 24px rgba(255,123,0,0.5)', lineHeight: 1, marginBottom: '16px' }}>
                {formatNum(seasonSummary.ppp, 2)}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>POINTS PER POSSESSION</div>
              <div style={{ fontSize: '13px', background: 'rgba(255,255,255,0.05)', display: 'inline-block', padding: '6px 16px', borderRadius: '6px', alignSelf: 'flex-start', marginTop: 'auto' }}>
                <span style={{ color: 'var(--text)' }}>PACE: {formatNum(seasonSummary.pace, 1)}</span>
              </div>
            </div>
          </div>

          {/* Row 2: Latest Game & MVP */}
          {latestGame && (
            <div className="grid-2col-responsive">
              
              {/* Latest Game */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Latest Game Recap</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{col(latestGame, 'date')}</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, marginBottom: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>🛡️</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>TEAM</div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <span className="mobile-text-large" style={{ fontSize: '48px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{col(latestGame, 'team', 'pts') || col(latestGame, 'pts', 'us')}</span>
                      <span style={{ fontSize: '24px', color: 'var(--muted)' }}>-</span>
                      <span className="mobile-text-large" style={{ fontSize: '48px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{col(latestGame, 'opp', 'pts')}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '4px', letterSpacing: '0.1em' }}>FINAL SCORE</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>⚔️</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--muted)' }}>OPP</div>
                  </div>
                </div>

                <button 
                  onClick={() => handleNavigate('/report', latestGame.GameID)}
                  style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--neon-cyan)', border: '1px solid var(--neon-cyan)', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--mono)', letterSpacing: '0.05em', transition: 'all 0.2s', width: '100%' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.3)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  VIEW GAME REPORT →
                </button>
              </div>

              {/* MVP Stats */}
              {mvp && (
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>MVP Stats</div>
                  
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                      👤
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.05em', textShadow: '0 0 8px rgba(0,240,255,0.3)' }}>PLAYER OF THE GAME</div>
                      <div style={{ fontSize: '24px', fontWeight: 700 }}>#{mvp['背番号']} {mvp['コートネーム'] || mvp['選手名']}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--mono)' }}>{mvp.PTS}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>PTS</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--mono)' }}>{(parseNum(mvp.OR) + parseNum(mvp.DR))}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>REB</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--mono)' }}>{mvp.AST}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>AST</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--neon-orange)', textShadow: '0 0 10px rgba(255,123,0,0.3)' }}>{formatNum(mvp.FP, 1)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--neon-orange)' }}>FP</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: QUICK ACCESS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.1em' }}>QUICK ACCESS</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div 
              onClick={() => handleNavigate('/report')}
              className="animated-card"
              style={{ padding: '24px', cursor: 'pointer', background: 'rgba(0, 240, 255, 0.05)', border: '1px solid var(--neon-cyan)', borderRadius: '12px', boxShadow: 'inset 0 0 20px rgba(0, 240, 255, 0.05), 0 0 10px rgba(0, 240, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px', letterSpacing: '0.05em' }}>GAME REPORT</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Visual momentum & flows</div>
              </div>
              <div style={{ fontSize: '28px', color: 'var(--neon-cyan)', filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.6))' }}>📈</div>
            </div>

            <div 
              onClick={() => handleNavigate('/game')}
              className="animated-card"
              style={{ padding: '24px', cursor: 'pointer', background: 'rgba(255, 123, 0, 0.05)', border: '1px solid var(--neon-orange)', borderRadius: '12px', boxShadow: 'inset 0 0 20px rgba(255, 123, 0, 0.05), 0 0 10px rgba(255, 123, 0, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px', letterSpacing: '0.05em' }}>BOX SCORE</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Game stats & advanced metrics</div>
              </div>
              <div style={{ fontSize: '28px', color: 'var(--neon-orange)', filter: 'drop-shadow(0 0 8px rgba(255,123,0,0.6))' }}>📋</div>
            </div>

            <div 
              onClick={() => handleNavigate('/player')}
              className="animated-card"
              style={{ padding: '24px', cursor: 'pointer', background: 'rgba(0, 240, 255, 0.05)', border: '1px solid var(--neon-cyan)', borderRadius: '12px', boxShadow: 'inset 0 0 20px rgba(0, 240, 255, 0.05), 0 0 10px rgba(0, 240, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px', letterSpacing: '0.05em' }}>PLAYER STATS</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Individual season averages</div>
              </div>
              <div style={{ fontSize: '28px', color: 'var(--neon-cyan)', filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.6))' }}>👤</div>
            </div>

            <div 
              onClick={() => handleNavigate('/lineup')}
              className="animated-card"
              style={{ padding: '24px', cursor: 'pointer', background: 'rgba(181, 53, 246, 0.05)', border: '1px solid var(--neon-purple)', borderRadius: '12px', boxShadow: 'inset 0 0 20px rgba(181, 53, 246, 0.05), 0 0 10px rgba(181, 53, 246, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px', letterSpacing: '0.05em' }}>LINEUPS</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>5-man combinations & +/-</div>
              </div>
              <div style={{ fontSize: '28px', color: 'var(--neon-purple)', filter: 'drop-shadow(0 0 8px rgba(181,53,246,0.6))' }}>👥</div>
            </div>

            <div 
              onClick={() => handleNavigate('/team')}
              className="animated-card"
              style={{ padding: '24px', cursor: 'pointer', background: 'rgba(0, 230, 118, 0.05)', border: '1px solid var(--neon-green)', borderRadius: '12px', boxShadow: 'inset 0 0 20px rgba(0, 230, 118, 0.05), 0 0 10px rgba(0, 230, 118, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px', letterSpacing: '0.05em' }}>TEAM OVERALL</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>4 factors & W/L analysis</div>
              </div>
              <div style={{ fontSize: '28px', color: 'var(--neon-green)', filter: 'drop-shadow(0 0 8px rgba(0,230,118,0.6))' }}>🏢</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
