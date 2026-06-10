import { fetchAllData } from '@/lib/google-sheets';
import LineupClient from './LineupClient';

export const revalidate = 60; // 1分間キャッシュ

export default async function LineupPage() {
  const data = await fetchAllData();
  return <LineupClient initialData={data} />;
}
