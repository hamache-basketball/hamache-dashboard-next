import { fetchAllData } from '@/lib/google-sheets';
import HomeClient from './HomeClient';

export const revalidate = 3600;

export default async function HomePage() {
  const data = await fetchAllData();
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: 'var(--text)' }}>


      <HomeClient initialData={data} />
    </div>
  );
}
