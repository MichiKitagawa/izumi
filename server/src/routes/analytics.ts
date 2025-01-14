// src/routes/analytics.ts
import { Router, Request, Response } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authenticate';
import UserLog from '../models/UserLog';
import Subscription from '../models/Subscription';
import Product from '../models/Product';
import DownloadHistory from '../models/DownloadHistory';

const router = Router();

// ユーザー行動ログの取得（管理者専用）
router.get('/user-logs', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  try {
    const logs = await UserLog.findAll({
      include: [{ model: UserLog.associations.user.target, as: 'user', attributes: ['id', 'email', 'name'] }],
      order: [['timestamp', 'DESC']],
    });
    res.status(200).json({ logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user logs.' });
  }
});
// 収益レポートの取得（管理者専用）
router.get('/revenue-report', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  try {
    // サブスクリプション収益
    const subscriptions = await Subscription.findAll();
    const subscriptionRevenue = subscriptions.reduce((acc, sub) => {
      let price = 0;
      switch (sub.plan) {
        case 'Basic':
          price = 890;
          break;
        case 'Pro':
          price = 1280;
          break;
        case 'Premium':
          price = 1980;
          break;
        default:
          price = 0;
      }
      return acc + price;
    }, 0);

    // トランザクションフィー収益
    const products = await Product.findAll();
    const transactionFees = products.reduce((acc, product) => {
      const feePercentage = 0.1; // 10%
      return acc + product.fileSize * feePercentage;
    }, 0);

    res.status(200).json({
      subscriptionRevenue,
      transactionFees,
      totalRevenue: subscriptionRevenue + transactionFees,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch revenue report.' });
  }
});

export default router;
