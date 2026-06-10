import { fetchAllData } from "@/lib/google-sheets";
import ReportClient from "./ReportClient";

export const revalidate = 60; // ISR

export default async function ReportPage() {
  const data = await fetchAllData();
  
  return (
    <div className="page active" style={{ paddingBottom: '80px' }}>
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <h1 className="page-title gradient-text" style={{ fontSize: '28px', fontWeight: 700 }}>試合レポート</h1>
        <p className="page-sub" style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
          試合の流れと貢献度をビジュアルで確認
        </p>
      </div>

      <ReportClient initialData={data} />
    </div>
  );
}
