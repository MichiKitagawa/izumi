// src/pages/RevenueReport.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchRevenueData } from '../services/revenueService'; // データ取得用サービス
import RevenueChart from '../components/RevenueChart'; // 収益チャートコンポーネント

export interface RevenueData {
  month: string;
  amount: number;
}

const RevenueReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getRevenueData = async () => {
      try {
        const result = await fetchRevenueData();
        setData(result);
      } catch (err: unknown) {
        console.error(err); // エラーをコンソールに出力
        setError(t('errorFetchingData'));
      } finally {
        setLoading(false);
      }
    };
    getRevenueData();
  }, [t]);

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>{t('revenueReport')}</h1>
      <RevenueChart data={data} />
      {/* 他の収益レポートに関するコンポーネントや情報を追加 */}
    </div>
  );
};

export default RevenueReport;
