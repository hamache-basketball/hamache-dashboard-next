import { fetchAllData } from '@/lib/google-sheets';
import PlayerClient from './PlayerClient';

export const revalidate = 60; // 1分間キャッシュ

export default async function PlayerPage() {
  const data = await fetchAllData();
  return <PlayerClient initialData={data} />;
}
