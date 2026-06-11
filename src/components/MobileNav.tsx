"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "HOME", path: "/", icon: "🏀" },
    { name: "REPORT", path: "/report", icon: "📊" },
    { name: "GAME", path: "/game", icon: "📋" },
    { name: "PLAYER", path: "/player", icon: "👤" },
    { name: "LINEUPS", path: "/lineup", icon: "👥" },
    { name: "TEAM", path: "/team", icon: "🏢" },
  ];

  return (
    <>
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                href={item.path} 
                key={item.path}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  padding: '8px 4px', color: isActive ? 'var(--neon-cyan)' : 'var(--muted)',
                  fontSize: '9px', fontFamily: 'var(--sans)', textDecoration: 'none',
                  flex: 1, textAlign: 'center',
                  background: isActive ? 'rgba(0, 240, 255, 0.05)' : 'transparent',
                  borderRadius: '8px',
                  boxShadow: isActive ? 'inset 0 0 5px rgba(0,240,255,0.1)' : 'none'
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1, filter: isActive ? 'drop-shadow(0 0 5px rgba(0,240,255,0.5))' : 'none' }}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
      <style>{`
        .mobile-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(11, 15, 25, 0.9);
          backdrop-filter: blur(16px);
          border-top: 1px solid var(--border2);
          z-index: 50; padding: 8px 8px calc(8px + env(safe-area-inset-bottom, 0px));
        }
        .mobile-nav-inner {
          display: flex; justify-content: space-around; align-items: center;
        }
        @media(max-width: 768px) {
          .mobile-nav { display: block; }
        }
      `}</style>
    </>
  );
}
