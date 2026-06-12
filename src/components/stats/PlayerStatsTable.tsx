'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { formatNum } from '@/lib/stats-logic';
import { useGlobalState } from '@/lib/GlobalStateProvider';

interface PlayerStatsTableProps {
  players: any[];
}

export default function PlayerStatsTable({ players }: PlayerStatsTableProps) {
  const router = useRouter();
  const { setGlobalPlayerName } = useGlobalState();

  return (
    <div className="glass-panel" style={{ overflowX: 'auto', padding: '10px 0' }}>
      <div style={{ padding: '10px 20px', fontSize: '11px', color: 'var(--muted)' }}>
        ※ +/-, FP, EFF, USG% の用語解説はページ下部をご覧ください。
      </div>
      <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px', fontFamily: 'var(--mono)' }}>
        <thead>
          <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)', fontSize: '11px' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>#</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>選手名</th>
            <th style={{ padding: '12px 16px' }}>MIN</th>
            <th style={{ padding: '12px 16px' }}>PTS</th>
            <th style={{ padding: '12px 16px' }}>FGM/A</th>
            <th style={{ padding: '12px 16px' }}>EFG%</th>
            <th style={{ padding: '12px 16px' }}>3PM/A</th>
            <th style={{ padding: '12px 16px' }}>FTM/A</th>
            <th style={{ padding: '12px 16px' }}>OR</th>
            <th style={{ padding: '12px 16px' }}>DR</th>
            <th style={{ padding: '12px 16px' }}>AST</th>
            <th style={{ padding: '12px 16px' }}>TO</th>
            <th style={{ padding: '12px 16px' }}>STL</th>
            <th style={{ padding: '12px 16px' }}>BLK</th>
            <th style={{ padding: '12px 16px' }}>+/-</th>
            <th style={{ padding: '12px 16px' }}>FP</th>
            <th style={{ padding: '12px 16px' }}>EFF</th>
            <th style={{ padding: '12px 16px' }}>USG%</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => {
            const pm = parseFloat(p.PlusMinus || 0);
            return (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)' }}>{p['背番号'] || '-'}</td>
                <td 
                  style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--accent2)', fontFamily: '"Inter", sans-serif', whiteSpace: 'nowrap', cursor: 'pointer' }}
                  onClick={() => {
                    const name = p['コートネーム'] || p['選手名'];
                    if (name) {
                      setGlobalPlayerName(name);
                      router.push('/player');
                    }
                  }}
                >
                  <span style={{ textDecoration: 'underline' }}>{p['コートネーム'] || p['選手名']}</span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.MIN || '0'}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text)' }}>{p.PTS || '0'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.FGM || '0'}/{p.FGA || '0'}</td>
                <td style={{ padding: '12px 16px' }}>{formatNum(p.EFG, 1)}%</td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p['3PM'] || '0'}/{p['3PA'] || '0'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.FTM || '0'}/{p.FTA || '0'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.OR || '0'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.DR || '0'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.AST || '0'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.TO || '0'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.STL || '0'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.BLK || '0'}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: pm > 0 ? 'var(--accent)' : pm < 0 ? 'var(--accent2)' : 'var(--muted)' }}>
                  {pm > 0 ? `+${pm}` : pm}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accent)' }}>{formatNum(p.FP, 1)}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accent)' }}>{formatNum(p.EFF, 0)}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accent)' }}>{formatNum(p.USG, 1)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
