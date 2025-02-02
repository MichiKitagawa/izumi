// server/src/routes/subscription.ts
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authenticate';
import Subscription from '../models/Subscription';
import stripe from '../config/stripe';
import User from '../models/User';
import Stripe from 'stripe';
import { getUserActiveSubscription } from '../utils/subscription';
import bodyParser from 'body-parser';

const router = Router();

// サブスクリプション状態取得エンドポイント
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const subscription = await getUserActiveSubscription(userId);
    res.json({ active: !!subscription, subscription });
  } catch (err) {
    console.error('Error fetching subscription status:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Checkout セッション作成エンドポイント
router.post('/create-checkout-session', authenticateToken, async (req: Request, res: Response) => {
  const { priceId } = req.body;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    // ユーザー取得
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Stripe カスタマーの作成または取得
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      user.stripeCustomerId = customer.id;
      await user.save();
      customerId = customer.id;
    }

    // Checkout セッションの作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    res.json({ id: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Webhook 受信エンドポイント（raw ボディで受け取る）
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.subscription) {
      console.warn('No subscription ID found in checkout.session.completed event.');
      return res.json({ received: true });
    }
    const subscriptionId = session.subscription as string;

    try {
      // サブスクリプション情報取得
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const customerId = subscription.customer as string;
      const user = await User.findOne({ where: { stripeCustomerId: customerId } });
      if (user) {
        // 契約期間の計算
        const startDate = new Date(subscription.start_date * 1000);
        const recurringInterval = subscription.items.data[0].price.recurring?.interval;
        let computedEndDate: Date;
        if (recurringInterval === 'year') {
          computedEndDate = new Date(startDate);
          computedEndDate.setDate(computedEndDate.getDate() + 365);
        } else if (recurringInterval === 'month') {
          computedEndDate = new Date(startDate);
          computedEndDate.setDate(computedEndDate.getDate() + 30);
        } else {
          // それ以外の場合は current_period_end を使用
          computedEndDate = new Date(subscription.current_period_end * 1000);
        }

        await Subscription.create({
          userId: user.id,
          stripeSubscriptionId: subscription.id,
          plan: subscription.items.data[0].price.nickname || 'Unknown Plan',
          status: subscription.status,
          startDate: startDate,
          endDate: computedEndDate,
        });
      } else {
        console.error('User not found for customerId:', customerId);
      }
    } catch (error) {
      console.error('Error handling checkout.session.completed:', error);
    }
  }

  res.json({ received: true });
});

export default router;
