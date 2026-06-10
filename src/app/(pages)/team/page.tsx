import { fetchAllData } from '@/lib/google-sheets';
import TeamClient from './TeamClient';

export const revalidate = 60; // 1分間キャッシュ

export default async function TeamPage() {
  const data = await fetchAllData();
  return <TeamClient initialData={data} />;
}
