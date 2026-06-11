"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "HOME", path: "/", icon: "🏀" },
    { name: "REPORT", path: "/report", icon: "📊" },
    { name: "BOX SCORE", path: "/game", icon: "📋" },
    { name: "PLAYER", path: "/player", icon: "👤" },
    { name: "LINEUPS", path: "/lineup", icon: "👥" },
    { name: "TEAM", path: "/team", icon: "🏢" },
  ];

  return (
    <nav style={{
      width: '80px',
      flexShrink: 0,
      background: 'rgba(11, 15, 25, 0.8)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border)',
      padding: '24px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto'
    }} className="sidebar">
      
      <div style={{ marginBottom: '40px', color: 'var(--neon-cyan)', fontSize: '24px', filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.4))' }}>
        ⚡
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              href={item.path} 
              key={item.path}
              title={item.name}
              style={{
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '12px', 
                cursor: 'pointer',
                color: isActive ? 'var(--neon-cyan)' : 'var(--muted)',
                background: isActive ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                boxShadow: isActive ? 'inset 0 0 10px rgba(0,240,255,0.2)' : 'none',
                textDecoration: 'none', 
                transition: 'all .2s'
              }}
              className="nav-item"
            >
              <span style={{ fontSize: '20px', filter: isActive ? 'drop-shadow(0 0 5px rgba(0,240,255,0.5))' : 'none' }}>{item.icon}</span>
            </Link>
          );
        })}
      </div>
      <style>{`
        @media(max-width: 768px) {
          .sidebar { display: none !important; }
        }
        .nav-item:hover {
          background: rgba(255,255,255,0.05) !important;
          color: var(--text) !important;
        }
      `}</style>
    </nav>
  );
}
