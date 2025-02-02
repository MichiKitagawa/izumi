// server/src/middleware/checkSubscription.ts
import { Request, Response, NextFunction } from 'express';
import { getUserActiveSubscription } from '../utils/subscription';
import { getOrCreateAIUsage, incrementAIUsage } from '../utils/aiUsage';
import SubscriptionFeature from '../models/SubscriptionFeature';

const checkSubscription = (feature?: string) => {
  return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const subscription = await getUserActiveSubscription(userId);
    if (!subscription) {
      return res.status(403).json({ message: 'No active subscription found.' });
    }

    // サブスクリプション情報をリクエストに追加
    req.user.subscription = subscription;

    if (feature) {
      // プランごとの制限を取得
      const featureRecord = await SubscriptionFeature.findOne({
        where: { plan: subscription.plan, feature },
      });

      if (!featureRecord) {
        return res.status(500).json({ message: 'Subscription feature not defined.' });
      }

      const value = featureRecord.value;

      if (value !== 'unlimited') {
        // 使用制限がある場合
        const usage = await getOrCreateAIUsage(userId, feature);
        const limit = parseInt(value, 10);

        if (usage.usageCount >= limit) {
          return res.status(429).json({ message: `AI feature usage limit reached for ${subscription.plan} plan.` });
        }

        // 使用回数をインクリメント
        await incrementAIUsage(usage);
      }
    }

    next();
  };
};

export default checkSubscription;
