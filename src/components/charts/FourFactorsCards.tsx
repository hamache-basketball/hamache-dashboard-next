'use client';

import React from 'react';

interface FourFactorsCardsProps {
  ourData: number[];
  oppData: number[];
  details?: { us: string, opp: string }[];
}

const factors = [
  { key: 'eFG%', index: 0, higherIsBetter: true, color: 'var(--accent)', oppColor: 'var(--accent2)' },
  { key: 'TO%', index: 1, higherIsBetter: false, color: 'var(--accent)', oppColor: 'var(--accent2)' },
  { key: 'OR%', index: 2, higherIsBetter: true, color: 'var(--accent)', oppColor: 'var(--accent2)' },
  { key: 'FTR', index: 3, higherIsBetter: true, color: 'var(--accent)', oppColor: 'var(--accent2)' },
];

export default function FourFactorsCards({ ourData, oppData, details }: FourFactorsCardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
      {factors.map(f => {
        const us = ourData[f.index] || 0;
        const opp = oppData[f.index] || 0;
        const detail = details ? details[f.index] : null;
        const diff = us - opp;
        const isBetter = f.higherIsBetter ? diff > 0 : diff < 0;
        const isWorse = f.higherIsBetter ? diff < 0 : diff > 0;
        
        let diffColor = 'var(--muted)';
        let diffArrow = '';
        if (isBetter) diffColor = 'var(--accent)'; // Greenish
        else if (isWorse) diffColor = 'var(--accent2)'; // Redish
        
        if (diff > 0) diffArrow = '▲';
        if (diff < 0) diffArrow = '▼';

        const diffStr = Math.abs(diff).toFixed(1) + '%';
        const total = us + opp || 1;
        const usPct = (us / total) * 100;

        return (
          <div key={f.key} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
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

              <div style={{ height: '4px', background: 'var(--bg3)', borderRadius: '2px', display: 'flex', overflow: 'hidden', marginBottom: detail ? '16px' : '0' }}>
                <div style={{ width: `${usPct}%`, background: f.color, transition: 'width 1s ease' }} />
                <div style={{ width: `${100 - usPct}%`, background: f.oppColor, transition: 'width 1s ease' }} />
              </div>
            </div>
            
            {detail && (
              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.1)', fontSize: '11px', fontFamily: 'var(--mono)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text)', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--muted)' }}>自:</span>
                  <span>{detail.us}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--muted)' }}>相:</span>
                  <span>{detail.opp}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
