'use client';

import React, { useEffect, useState } from 'react';

interface SankeyChartProps {
  pa2: number;
  pm2: number;
  pa3: number;
  pm3: number;
  fta: number;
  ftm: number;
  to: number;
  orb: number;
}

export default function SankeyChart({ pa2, pm2, pa3, pm3, fta, ftm, to, orb }: SankeyChartProps) {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    const fga = pa2 + pa3;
    const miss2 = pa2 - pm2;
    const miss3 = Math.max(0, pa3 - pm3);
    const totalMisses = miss2 + miss3;
    const drLost = Math.max(0, totalMisses - orb);
    const ftMiss = fta - ftm;
    const offense = fga + to + Math.round(fta * 0.44);

    if (!offense) {
      setSvgContent('<div class="empty-state">No possession data</div>');
      return;
    }

    const C = {
      flow:  '#4f8ef7',
      made:  '#38d9a9',
      miss:  '#f06f6f',
      ft:    '#f7a84f',
      orb:   '#7f77dd',
      to:    '#f06f6f',
      dr:    '#7a8099',
    };

    const minH = 320, maxH = 520;
    const W = 700, T = 24, B = 40;
    const H = Math.min(maxH, Math.max(minH, offense * 5));
    const drawH = H - T - B;
    const scale = (v: number) => Math.max(5, Math.round((v / offense) * drawH));
    const GAP = 4;
    const NW = 12;
    const X = { off: 60, mid: 192, p2p3: 328, result: 464, total: 562, final: 642 };

    const hFGA = scale(fga), hTO = scale(to), hFT = scale(fta);
    const h2PA = scale(pa2), h3PA = scale(pa3);
    const h2PM = scale(pm2), h2Miss = scale(miss2);
    const h3PM = scale(pm3), h3Miss = scale(miss3);
    const hFTM = scale(ftm), hFTMiss = scale(ftMiss);
    const hTotal = scale(totalMisses);
    const hOR = scale(orb), hDR = scale(drLost);

    const yOff = T, hOff = scale(offense);
    const yFGA = T, yTO = yFGA + hFGA + GAP, yFT = yTO + hTO + GAP;
    const y2PA = T, y3PA = y2PA + h2PA + GAP;
    const y2PM = T, y2Miss = y2PM + h2PM + GAP;
    const y3PM = y3PA, y3Miss = y3PM + h3PM + GAP;
    const yFTM = yFT, yFTMiss = yFTM + hFTM + GAP;
    const yTotal = y2Miss;
    const yOR = yTotal, yDR = yOR + hOR + GAP;

    const band = (x1: number, y1: number, h1: number, x2: number, y2: number, h2: number, col: string, opacity = 0.22) => {
      const mx = (x1 + x2) / 2;
      return `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2} L${x2},${y2+h2} C${mx},${y2+h2} ${mx},${y1+h1} ${x1},${y1+h1} Z" fill="${col}" opacity="${opacity}"/>`;
    };

    const bar = (x: number, y: number, h: number, col: string, opacity = 0.9) => 
      `<rect x="${x}" y="${y}" width="${NW}" height="${h}" rx="3" fill="${col}" opacity="${opacity}"/>`;

    const labelR = (x: number, y: number, h: number, name: string, val: number, col: string) => {
      const cy = y + h / 2;
      return `<text font-size="10" font-family="monospace" fill="#9098b0" x="${x+NW+6}" y="${cy-5}" dominant-baseline="central">${name}</text>`+
             `<text font-size="12" font-weight="500" font-family="monospace" fill="${col}" x="${x+NW+6}" y="${cy+7}" dominant-baseline="central">${val}</text>`;
    };

    const labelL = (x: number, y: number, h: number, name: string, val: number, col: string) => {
      const cy = y + h / 2;
      return `<text font-size="10" font-family="monospace" fill="#9098b0" x="${x-4}" text-anchor="end" y="${cy-5}" dominant-baseline="central">${name}</text>`+
             `<text font-size="12" font-weight="500" font-family="monospace" fill="${col}" x="${x-4}" text-anchor="end" y="${cy+7}" dominant-baseline="central">${val}</text>`;
    };

    const badge = (x: number, y: number, w: number, h: number, label: string, val: number, col: string, bgOpacity = 0.12) => 
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${col}" opacity="${bgOpacity}" stroke="${col}" stroke-width="0.5"/>`+
      `<text font-size="10" font-family="monospace" fill="${col}" x="${x+w/2}" y="${y+h/2-4}" text-anchor="middle" dominant-baseline="central">${label}</text>`+
      `<text font-size="12" font-weight="500" font-family="monospace" fill="${col}" x="${x+w/2}" y="${y+h/2+8}" text-anchor="middle" dominant-baseline="central">${val}</text>`;

    let s = \`<svg width="100%" viewBox="0 0 \${W} \${H}" xmlns="http://www.w3.org/2000/svg">\`;

    const legend = [['シュートフロー','#4f8ef7'],['成功（得点）','#38d9a9'],['失敗・ミス','#f06f6f'],['FT','#f7a84f'],['OReb','#7f77dd']];
    let lx = 20;
    legend.forEach(([lbl, col]) => {
      s += \`<rect x="\${lx}" y="6" width="8" height="8" rx="2" fill="\${col}"/>\`;
      s += \`<text font-size="9" font-family="monospace" fill="#9098b0" x="\${lx+11}" y="10" dominant-baseline="central">\${lbl}</text>\`;
      lx += lbl.length * 6 + 26;
    });

    s+=band(X.off+NW, yOff, hFGA,  X.mid, yFGA, hFGA, C.flow);
    s+=band(X.off+NW, yOff+hFGA, hTO, X.mid, yTO, hTO, C.to);
    s+=band(X.off+NW, yOff+hFGA+hTO, hFT, X.mid, yFT, hFT, C.ft);
    s+=band(X.mid+NW, yFGA, h2PA, X.p2p3, y2PA, h2PA, C.flow);
    s+=band(X.mid+NW, yFGA+h2PA, h3PA, X.p2p3, y3PA, h3PA, C.flow, 0.15);
    s+=band(X.p2p3+NW, y2PA, h2PM, X.result, y2PM, h2PM, C.made);
    s+=band(X.p2p3+NW, y2PA+h2PM, h2Miss, X.result, y2Miss, h2Miss, C.miss);
    if(pm3>0) s+=band(X.p2p3+NW, y3PA, h3PM, X.result, y3PM, h3PM, C.made);
    if(miss3>0) s+=band(X.p2p3+NW, y3PA+h3PM, h3Miss, X.result, y3Miss, h3Miss, C.miss, 0.18);
    if(ftm>0) s+=band(X.mid+NW, yFT, hFTM, X.result, yFTM, hFTM, C.made);
    if(ftMiss>0) s+=band(X.mid+NW, yFT+hFTM, hFTMiss, X.result, yFTMiss, hFTMiss, C.dr, 0.15);
    s+=band(X.result+NW, y2Miss, h2Miss, X.total, yTotal, hTotal, C.miss, 0.18);
    if(miss3>0) s+=band(X.result+NW, y3Miss, h3Miss, X.total, yTotal+h2Miss, h3Miss, C.miss, 0.15);
    if(orb>0) s+=band(X.total+NW, yOR, hOR, X.final-56, yOR, hOR, C.orb, 0.2);
    if(drLost>0) s+=band(X.total+NW, yOR+hOR+GAP, hDR, X.final-56, yOR+hOR+GAP, hDR, C.dr, 0.15);

    s+=bar(X.off, yOff, hOff, C.flow);
    s+=bar(X.mid, yFGA, hFGA, C.flow);
    s+=bar(X.mid, yTO, hTO, C.to);
    s+=bar(X.mid, yFT, hFT, C.ft);
    s+=bar(X.p2p3, y2PA, h2PA, C.flow);
    s+=bar(X.p2p3, y3PA, h3PA, C.flow, 0.7);
    s+=bar(X.result, y2PM, h2PM, C.made);
    s+=bar(X.result, y2Miss, h2Miss, C.miss);
    if(pm3>0) s+=bar(X.result, y3PM, h3PM, C.made, 0.8);
    if(miss3>0) s+=bar(X.result, y3Miss, h3Miss, C.miss, 0.8);
    if(ftm>0) s+=bar(X.result, yFTM, hFTM, C.made, 0.8);
    if(ftMiss>0) s+=bar(X.result, yFTMiss, hFTMiss, C.dr, 0.7);
    s+=bar(X.total, yTotal, hTotal, C.miss, 0.8);

    s+=labelL(X.off, yOff, hOff, 'Offense', offense, C.flow);
    s+=labelR(X.mid, yFGA, hFGA, 'FGA', fga, C.flow);
    s+=labelR(X.mid, yTO, hTO, 'Turnovers', to, C.to);
    s+=labelR(X.mid, yFT, hFT, 'Free Throws', fta, C.ft);
    s+=labelR(X.p2p3, y2PA, h2PA, '2P Attempts', pa2, C.flow);
    s+=labelR(X.p2p3, y3PA, h3PA, '3P Attempts', pa3, C.flow);
    s+=labelR(X.result, y2PM, h2PM, '2P Made', pm2, C.made);
    s+=labelR(X.result, y2Miss, h2Miss, '2P Missed', miss2, C.miss);
    if(pm3>0) s+=labelR(X.result, y3PM, h3PM, '3P Made', pm3, C.made);
    if(miss3>0) s+=labelR(X.result, y3Miss, h3Miss, '3P Missed', miss3, C.miss);
    if(ftm>0) s+=labelR(X.result, yFTM, hFTM, 'FT Made', ftm, C.made);
    if(ftMiss>0) s+=labelR(X.result, yFTMiss, hFTMiss, 'FT Missed', ftMiss, C.dr);
    s+=labelR(X.total, yTotal, hTotal, 'Total Misses', totalMisses, C.miss);

    const BW=58, BH=30;
    if(orb>0) s+=badge(X.final-54, yOR, BW, BH, 'Off.Reb', orb, C.orb);
    if(drLost>0) s+=badge(X.final-54, yOR+hOR+GAP, BW, BH, 'Def.Reb', drLost, C.dr);

    s+='</svg>';
    setSvgContent(s);
  }, [pa2, pm2, pa3, pm3, fta, ftm, to, orb]);

  return <div dangerouslySetInnerHTML={{ __html: svgContent }} style={{ width: '100%', height: 'auto', minHeight: '320px', fontFamily: 'var(--mono)' }} />;
}
