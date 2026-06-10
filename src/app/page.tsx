import { fetchAllData } from "@/lib/google-sheets";

export default async function Home() {
  const data = await fetchAllData();
  const gameCount = data.games.length;
  // 選手の一意な数をカウント
  const uniquePlayers = new Set(data.players.map(p => p['選手名'])).size;
  
  return (
    <div className="page active">
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <h1 className="page-title gradient-text" style={{ fontSize: '28px', fontWeight: 700 }}>HAMACHE Dashboard</h1>
        <p className="page-sub" style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
          Next.js App Router による次世代バスケットボール・アナリティクス
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-panel animated-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)', marginBottom: '8px' }}>Total Games</div>
          <div style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{gameCount}</div>
        </div>
        
        <div className="glass-panel animated-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)', marginBottom: '8px' }}>Active Players</div>
          <div style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent2)' }}>{uniquePlayers}</div>
        </div>
        
        <div className="glass-panel animated-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)', marginBottom: '8px' }}>Lineup Data</div>
          <div style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent3)' }}>{data.lineups.length}</div>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '40px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', color: 'var(--text)', marginBottom: '16px' }}>🚀 システム初期化完了</h2>
        <p style={{ color: 'var(--muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.8 }}>
          Google Sheets APIからのデータ取得（Server-Side Rendering）が正常に動作しています。<br/>
          APIキーやSheet IDはサーバー側で安全に処理されており、クライアントには公開されません。<br/>
          引き続き、左側のメニューからアクセスできる各分析ページを実装していきます。
        </p>
      </div>
    </div>
  );
}
