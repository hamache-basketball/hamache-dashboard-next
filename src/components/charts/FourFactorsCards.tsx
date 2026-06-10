'use client';

import React from 'react';

interface FourFactorsCardsProps {
  ourData: number[];
  oppData: number[];
}

const factors = [
  { key: 'eFG%', index: 0, higherIsBetter: true, color: '#38d9a9', oppColor: '#f06f6f' },
  { key: 'TO%', index: 1, higherIsBetter: false, color: '#f06f6f', oppColor: '#4f8ef7' },
  { key: 'OR%', index: 2, higherIsBetter: true, color: '#f7a84f', oppColor: '#f06f6f' },
  { key: 'FTR', index: 3, higherIsBetter: true, color: '#4f8ef7', oppColor: '#f06f6f' },
];

export default function FourFactorsCards({ ourData, oppData }: FourFactorsCardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
      {factors.map(f => {
        const us = ourData[f.index] || 0;
        const opp = oppData[f.index] || 0;
        const diff = us - opp;
        const isBetter = f.higherIsBetter ? diff > 0 : diff < 0;
        const isWorse = f.higherIsBetter ? diff < 0 : diff > 0;
        
        let diffColor = 'var(--muted)';
        let diffArrow = '';
        if (isBetter) diffColor = '#38d9a9'; // Greenish
        else if (isWorse) diffColor = '#f06f6f'; // Redish
        
        if (diff > 0) diffArrow = '▲';
        if (diff < 0) diffArrow = '▼';

        const diffStr = Math.abs(diff).toFixed(1) + '%';
        const total = us + opp || 1;
        const usPct = (us / total) * 100;

        return (
          <div key={f.key} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>{f.key}</div>
            
            <div style={{ margin: '20px 0' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--mono)', color: f.color }}>
                {us.toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>相手 {opp.toFixed(1)}%</span>
                {diff !== 0 && (
                  <span style={{ color: diffColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '10px' }}>{diffArrow}</span>{diffStr}
                  </span>
                )}
              </div>
            </div>

            <div style={{ height: '4px', background: 'var(--bg3)', borderRadius: '2px', display: 'flex', overflow: 'hidden' }}>
              <div style={{ width: `${usPct}%`, background: f.color, transition: 'width 1s ease' }} />
              <div style={{ width: `${100 - usPct}%`, background: f.oppColor, transition: 'width 1s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
