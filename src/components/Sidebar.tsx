"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "試合レポート", path: "/", icon: "📋" },
    { name: "試合分析", path: "/game", icon: "🏀" },
    { name: "選手個人", path: "/player", icon: "👤" },
    { name: "ラインナップ", path: "/lineup", icon: "👥" },
    { name: "チーム全体", path: "/team", icon: "📊" },
  ];

  return (
    <nav style={{
      width: '200px',
      flexShrink: 0,
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      padding: '24px 0',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto'
    }} className="sidebar">
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '.08em', color: 'var(--accent3)', fontFamily: 'var(--mono)' }}>
          HAMACHE
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
          2026シーズン
        </div>
      </div>
      
      <div style={{ padding: '0 12px', marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '.1em', color: 'var(--muted)', fontFamily: 'var(--mono)', padding: '0 8px', marginBottom: '4px', textTransform: 'uppercase' }}>
          メニュー
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                href={item.path} 
                key={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
                  borderRadius: '8px', cursor: 'pointer',
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                  background: isActive ? 'rgba(79, 142, 247, 0.12)' : 'transparent',
                  fontWeight: isActive ? 500 : 400,
                  fontSize: '13px', textDecoration: 'none', transition: 'all .15s'
                }}
                className="nav-item"
              >
                <span style={{ width: '16px', textAlign: 'center', fontSize: '15px' }}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
      <style>{`
        @media(max-width: 768px) {
          .sidebar { display: none !important; }
        }
        .nav-item:hover {
          background: var(--bg3) !important;
          color: var(--text) !important;
        }
      `}</style>
    </nav>
  );
}
