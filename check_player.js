const fs = require('fs');
const data = JSON.parse(fs.readFileSync('db_player.json', 'utf8'));

const periods = new Set();
let tsubasaTO = 0;
data.forEach(row => {
  const vals = row.value;
  if (!vals) return;
  if (vals[2] !== 'Period') {
    periods.add(vals[2]);
  }
  if (vals[0] && vals[0].includes('20260418') && vals[1] === 'つばさ') {
    console.log(`Period: ${vals[2]}, TO: ${vals[17]}`);
    tsubasaTO += parseFloat(vals[17] || 0);
  }
});
console.log('Unique Periods:', Array.from(periods));
console.log('Total Tsubasa TO for game 20260418:', tsubasaTO);
