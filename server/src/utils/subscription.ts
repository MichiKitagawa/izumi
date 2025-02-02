// server/src/utils/subscription.ts
import Subscription from '../models/Subscription';
import { Op } from 'sequelize';

export const getUserActiveSubscription = async (userId: number) => {
  const subscription = await Subscription.findOne({
    where: {
      userId,
      status: 'active',
      endDate: { [Op.gt]: new Date() },
    },
    order: [['endDate', 'DESC']],
  });
  return subscription;
};
