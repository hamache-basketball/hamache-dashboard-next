const SHEET_ID = '1Q2c9BHrUHJB3dX2LpC7LJsVXgQqj5F_HLjrROHsRxl8';
const API_KEY = 'AIzaSyDDG3PeoGS6_0QBEo-H8VxKBU3XvrUJjhw';

export async function fetchSheet(sheetName: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
  
  // APIキーのHTTPリファラー制限を回避するため、元のダッシュボードのURLをRefererとして付与
  const res = await fetch(url, { 
    headers: {
      'Referer': 'https://hamache-basketball.github.io/hamache-dashboard/'
    },
    next: { revalidate: 60 } 
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${res.status}`);
  }
  
  const data = await res.json();
  const values = data.values || [];
  
  if (values.length < 2) return [];
  
  const headers = values[0].map((s: string) => s.trim());
  const rows = values.slice(1).map((row: string[]) => {
    const obj: Record<string, string> = {};
    headers.forEach((header: string, i: number) => {
      obj[header] = (row[i] || '').trim();
    });
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
  
  return { games, lineups, players };
}
