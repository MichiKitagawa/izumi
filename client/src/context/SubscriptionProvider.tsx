// client/src/context/SubscriptionProvider.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { SubscriptionContext, SubscriptionData } from './SubscriptionContext';
import { API_BASE_URL } from '../api';

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // API からサブスクリプション情報を取得する関数
  const refreshSubscription = async () => {
    setLoading(true);
    try {
      const res = await axios.get<{ active: boolean; subscription: SubscriptionData }>(
        `${API_BASE_URL}/subscription/status`, // 既存の API エンドポイントを利用（必要に応じて URL を調整）
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      if (res.data && res.data.active && res.data.subscription) {
        setSubscription(res.data.subscription);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      setSubscription(null);
    }
    setLoading(false);
  };

  // マウント時にサブスクリプション情報を取得
  useEffect(() => {
    refreshSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
