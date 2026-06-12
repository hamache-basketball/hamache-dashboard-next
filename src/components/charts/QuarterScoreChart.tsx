'use client';

import React from 'react';

interface QuarterScoreChartProps {
  data: { q: string; us: number; opp: number }[];
}

export default function QuarterScoreChart({ data }: QuarterScoreChartProps) {
  const maxScore = Math.max(...data.flatMap(d => [d.us, d.opp]), 10);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '140px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
        {data.map(d => (
          <div key={d.q} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px' }}>
              <div style={{ width: '14px', height: `${(d.us / maxScore) * 100}%`, background: 'var(--accent)', borderRadius: '3px 3px 0 0', transition: 'height 1s ease' }} />
              <div style={{ width: '14px', height: `${(d.opp / maxScore) * 100}%`, background: 'var(--accent2)', borderRadius: '3px 3px 0 0', transition: 'height 1s ease' }} />
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '12px' }}>
        {data.map(d => (
          <div key={d.q} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: '4px' }}>{d.q}</div>
            <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--mono)' }}>
              <span style={{ color: 'var(--accent)' }}>{d.us}</span>
              <span style={{ margin: '0 4px', color: 'var(--muted)' }}>-</span>
              <span style={{ color: 'var(--accent2)' }}>{d.opp}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '16px', marginTop: 'auto', paddingTop: '16px', fontSize: '11px', color: 'var(--muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
          自チーム
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent2)' }} />
          相手
        </div>
      </div>
    </div>
  );
}
