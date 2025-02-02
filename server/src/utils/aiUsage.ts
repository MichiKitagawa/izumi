// server/src/utils/aiUsage.ts
import AIUsageHistory from '../models/AIUsageHistory';
import { Op } from 'sequelize';

/**
 * ユーザーのAI使用状況を取得または初期化する関数
 * @param userId ユーザーID
 * @param feature AI機能名
 * @returns AIUsageHistory オブジェクト
 */
export const getOrCreateAIUsage = async (userId: number, feature: string): Promise<AIUsageHistory> => {
  const today = new Date();
  const existingUsage = await AIUsageHistory.findOne({
    where: {
      userId,
      feature,
      resetDate: {
        [Op.lte]: today,
      },
    },
    order: [['resetDate', 'DESC']],
  });

  if (existingUsage) {
    return existingUsage;
  }

  // 新しい使用履歴を作成
  const resetDate = new Date(today.getFullYear(), today.getMonth() + 1, 1); // 次の月の初日
  const newUsage = await AIUsageHistory.create({
    userId,
    feature,
    usageCount: 0,
    resetDate,
  });

  return newUsage;
};

/**
 * AI使用回数をインクリメントする関数
 * @param usage AIUsageHistory オブジェクト
 * @returns void
 */
export const incrementAIUsage = async (usage: AIUsageHistory): Promise<void> => {
  usage.usageCount += 1;
  await usage.save();
};
