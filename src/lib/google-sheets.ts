const SHEET_ID = '1Q2c9BHrUHJB3dX2LpC7LJsVXgQqj5F_HLjrROHsRxl8';
// APIキーは環境変数から取得します（セキュリティのためハードコードは避けます）
const API_KEY = process.env.GOOGLE_API_KEY;

export async function fetchSheet(sheetName: string) {
  if (!API_KEY) {
    throw new Error('GOOGLE_API_KEY environment variable is not set');
  }
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
  
  const res = await fetch(url, { 
    next: { revalidate: 60 } 
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${res.status}`);
  }
  
  const data = await res.json();
  const values = data.values || [];
  
  if (values.length < 2) return [];
  
  const headers = values[0].map((s: string, i: number) => s.trim() || `_col_${i}`);
  const rows = values.slice(1).map((row: string[]) => {
    const obj: Record<string, string> = {};
    const maxLen = Math.max(headers.length, row.length);
    for (let i = 0; i < maxLen; i++) {
      const header = headers[i] || `_col_${i}`;
      obj[header] = (row[i] || '').trim();
    }
    // 生の行データ配列を保持しておく（インデックスで直接アクセスするため）
    (obj as any)._rawRow = row;
    return obj;
  });
  
  return rows;
}

export async function fetchAllData() {
  const [games, lineups, players] = await Promise.all([
    fetchSheet('DB_Game_1'),
    fetchSheet('DB_Lineup_2'),
    fetchSheet('DB_Player_3')
  ]);
  
  const rawData = { games, lineups, players };
  // Force a deep clone to strip any non-serializable properties, prototypes, 
  // or Undici specific internal symbols that cause Next.js RSC stringify to crash.
  return JSON.parse(JSON.stringify(rawData));
}
