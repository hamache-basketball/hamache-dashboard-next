"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dribbble, BarChart2, ClipboardList, User, Users, Building, Trophy } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "HOME", path: "/", icon: <Dribbble size={20} /> },
    { name: "REPORT", path: "/report", icon: <BarChart2 size={20} /> },
    { name: "BOX SCORE", path: "/game", icon: <ClipboardList size={20} /> },
    { name: "PLAYER", path: "/player", icon: <User size={20} /> },
    { name: "LINEUPS", path: "/lineup", icon: <Users size={20} /> },
    { name: "TEAM", path: "/team", icon: <Building size={20} /> },
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
      
      <div style={{ marginBottom: '40px', color: 'var(--accent)', filter: 'drop-shadow(0 0 8px rgba(247,224,79,0.4))' }}>
        <Trophy size={28} strokeWidth={2.5} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} passHref key={item.path} legacyBehavior>
              <div
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
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                  background: isActive ? 'rgba(247, 224, 79, 0.1)' : 'transparent',
                  boxShadow: isActive ? 'inset 0 0 10px rgba(247,224,79,0.2)' : 'none',
                  textDecoration: 'none', 
                  transition: 'all .2s'
                }}
                className="nav-item"
              >
                <div style={{ display: 'flex', filter: isActive ? 'drop-shadow(0 0 5px rgba(247,224,79,0.5))' : 'none' }}>
                  {item.icon}
                </div>
              </div>
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
