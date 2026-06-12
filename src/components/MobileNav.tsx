"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dribbble, BarChart2, ClipboardList, User, Users, Building } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "HOME", path: "/", icon: <Dribbble size={18} /> },
    { name: "REPORT", path: "/report", icon: <BarChart2 size={18} /> },
    { name: "GAME", path: "/game", icon: <ClipboardList size={18} /> },
    { name: "PLAYER", path: "/player", icon: <User size={18} /> },
    { name: "LINEUPS", path: "/lineup", icon: <Users size={18} /> },
    { name: "TEAM", path: "/team", icon: <Building size={18} /> },
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
                  padding: '8px 4px', color: isActive ? 'var(--accent)' : 'var(--muted)',
                  fontSize: '9px', fontFamily: 'var(--sans)', textDecoration: 'none',
                  flex: 1, textAlign: 'center',
                  background: isActive ? 'rgba(247, 224, 79, 0.05)' : 'transparent',
                  borderRadius: '8px',
                  boxShadow: isActive ? 'inset 0 0 5px rgba(247,224,79,0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', marginBottom: '4px', filter: isActive ? 'drop-shadow(0 0 5px rgba(247,224,79,0.5))' : 'none' }}>{item.icon}</div>
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
