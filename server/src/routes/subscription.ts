// server/src/routes/subscription.ts
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authenticate';
import Subscription from '../models/Subscription';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// サブスクリプション登録
router.post('/subscribe', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { plan } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // プランのバリデーション
  const validPlans = ['Basic', 'Pro', 'Premium'];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ message: 'Invalid subscription plan.' });
  }

  try {
    // 既存のサブスクリプションを確認
    const existingSubscription = await Subscription.findOne({ where: { userId } });
    if (existingSubscription) {
      return res.status(400).json({ message: 'Subscription already exists.' });
    }

    // サブスクリプションの作成
    const subscription = await Subscription.create({
      userId,
      plan,
      status: 'active',
      startDate: new Date(),
      endDate: null,
    });

    res.status(201).json({ message: 'Subscribed successfully.', subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// サブスクリプションの変更
router.put('/change', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { plan } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // プランのバリデーション
  const validPlans = ['Basic', 'Pro', 'Premium'];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ message: 'Invalid subscription plan.' });
  }

  try {
    const subscription = await Subscription.findOne({ where: { userId } });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    subscription.plan = plan;
    await subscription.save();

    res.status(200).json({ message: 'Subscription plan updated successfully.', subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// サブスクリプションの解約
router.post('/cancel', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const subscription = await Subscription.findOne({ where: { userId } });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    subscription.status = 'canceled';
    subscription.endDate = new Date();
    await subscription.save();

    res.status(200).json({ message: 'Subscription canceled successfully.', subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
