import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "HAMACHE Dashboard",
  description: "Advanced Basketball Analytics Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Desktop Sidebar */}
          <Sidebar />
          
          <main style={{ flex: 1, minWidth: 0, padding: '32px 36px', paddingBottom: '100px' }}>
            {children}
          </main>
          
          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
