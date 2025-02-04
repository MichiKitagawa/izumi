// client/src/context/SubscriptionContext.ts
import { createContext } from 'react';

// サブスクリプション情報の型定義
export interface SubscriptionData {
  plan: string; // 例: 'Basic', 'Pro', 'Premium'
  // 必要に応じて追加情報（例：status, startDate, endDate）を定義可能
}

// コンテキストで提供するプロパティの型
export interface SubscriptionContextProps {
  subscription: SubscriptionData | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

// 初期値を設定してコンテキストを作成
export const SubscriptionContext = createContext<SubscriptionContextProps>({
  subscription: null,
  loading: true,
  refreshSubscription: async () => {},
});
