// server/src/utils/scheduler.ts
import cron from 'node-cron';
import Subscription from '../models/Subscription';
import { Op } from 'sequelize';
import AIUsageHistory from '../models/AIUsageHistory';

const updateSubscriptionStatuses = async () => {
  try {
    const now = new Date();
    await Subscription.update(
      { status: 'expired' },
      {
        where: {
          endDate: { [Op.lt]: now },
          status: { [Op.notIn]: ['expired', 'canceled'] },
        },
      }
    );
    console.log('Subscription statuses updated successfully.');
  } catch (error) {
    console.error('Error updating subscription statuses:', error);
  }
};

const resetAIUsage = async () => {
  try {
    const now = new Date();
    await AIUsageHistory.update(
      { usageCount: 0, resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1) },
      {
        where: {
          resetDate: { [Op.lte]: now },
        },
      }
    );
    console.log('AI usage counts reset successfully.');
  } catch (error) {
    console.error('Error resetting AI usage counts:', error);
  }
};

// 毎日午前0時にサブスクリプションステータスを更新
cron.schedule('0 0 * * *', () => {
  console.log('Running subscription status update job...');
  updateSubscriptionStatuses();
});

// 毎月1日にAI使用状況をリセット
cron.schedule('0 0 1 * *', () => {
  console.log('Running AI usage reset job...');
  resetAIUsage();
});
