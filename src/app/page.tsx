import { fetchAllData } from '@/lib/google-sheets';
import HomeClient from './HomeClient';

export const revalidate = 3600;

export default async function HomePage() {
  const data = await fetchAllData();
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: 'var(--text)' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--mono)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          HAMACHE Dashboard
        </h1>
        <p style={{ color: 'var(--muted)' }}>Next.js App Router による次世代バスケットボール・アナリティクス</p>
      </header>

      <HomeClient initialData={data} />
    </div>
  );
}
