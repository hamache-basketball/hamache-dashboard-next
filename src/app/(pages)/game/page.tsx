import { fetchAllData } from '@/lib/google-sheets';
import GameClient from './GameClient';

export const revalidate = 60; // 1分間キャッシュ

export default async function GamePage() {
  const data = await fetchAllData();
  return <GameClient initialData={data} />;
}
