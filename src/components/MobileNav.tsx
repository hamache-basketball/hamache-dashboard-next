"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "レポート", path: "/", icon: "📋" },
    { name: "分析", path: "/game", icon: "🏀" },
    { name: "選手", path: "/player", icon: "👤" },
    { name: "コンビ", path: "/lineup", icon: "👥" },
    { name: "チーム", path: "/team", icon: "📊" },
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
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                  padding: '6px 12px', color: isActive ? 'var(--accent)' : 'var(--muted)',
                  fontSize: '10px', fontFamily: 'var(--sans)', textDecoration: 'none'
                }}
              >
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.icon}</span>
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
          background: var(--bg2); border-top: 1px solid var(--border2);
          z-index: 50; padding: 6px 0 env(safe-area-inset-bottom, 6px);
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
