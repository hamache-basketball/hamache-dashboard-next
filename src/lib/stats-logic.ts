export const parseNum = (v: any): number => {
  const x = parseFloat(v);
  return isNaN(x) ? 0 : x;
};

export const formatNum = (v: any, d: number = 1): string => {
  const x = parseFloat(v);
  return isNaN(x) ? '—' : x.toFixed(d);
};

export const calcFP = (pts: any, or: any, dr: any, ast: any, stl: any, blk: any, to: any): number => {
  return parseNum(pts) * 1.0 + 
         (parseNum(or) + parseNum(dr)) * 1.2 + 
         parseNum(ast) * 1.5 + 
         parseNum(stl) * 3.0 + 
         parseNum(blk) * 3.0 - 
         parseNum(to) * 1.0;
};

export const calcEFF = (pts: any, reb: any, ast: any, stl: any, blk: any, fga: any, fgm: any, fta: any, ftm: any, to: any): number => {
  return parseNum(pts) + parseNum(reb) + parseNum(ast) + parseNum(stl) + parseNum(blk) - 
         (parseNum(fga) - parseNum(fgm)) - 
         (parseNum(fta) - parseNum(ftm)) - 
         parseNum(to);
};

export const calcEFG = (fgm: any, p3m: any, fga: any): number => {
  const attempts = parseNum(fga);
  if (attempts === 0) return 0;
  return ((parseNum(fgm) + 0.5 * parseNum(p3m)) / attempts) * 100;
};

export const calcUSG = (fga: any, fta: any, to: any, min: any, tmMin: any, tmFga: any, tmFta: any, tmTo: any): number => {
  const playerLoad = parseNum(fga) + 0.44 * parseNum(fta) + parseNum(to);
  const teamLoad = parseNum(tmFga) + 0.44 * parseNum(tmFta) + parseNum(tmTo);
  const m = parseNum(min);
  const tM = parseNum(tmMin);
  
  if (m === 0 || teamLoad === 0) return 0;
  return 100 * ((playerLoad * (tM / 5)) / (m * teamLoad));
};
