// server/src/routes/subscription.ts
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authenticate';
import Subscription from '../models/Subscription';
import stripe from '../config/stripe';
import User from '../models/User';
import Stripe from 'stripe';

const router = Router();

// Webhookエンドポイントは index.ts で設定済みなので、ここでは処理のみ記述

// Checkoutセッション作成エンドポイント
router.post('/create-checkout-session', authenticateToken, async (req: Request, res: Response) => {
  const { priceId } = req.body;
  const userId = req.user?.id;

  // ユーザーIDの確認ログ
  console.log('Received request for create-checkout-session');
  console.log('User ID:', userId);
  console.log('Price ID:', priceId);

  if (!userId) {
    console.log('No user ID found. Returning 401.');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // ユーザー取得
    const user = await User.findByPk(userId);
    console.log('Fetched User:', user);

    if (!user) {
      console.log('User not found in the database.');
      return res.status(404).json({ message: 'User not found.' });
    }

    // Stripeカスタマーの作成または取得
    let customerId = user.stripeCustomerId;
    console.log('Stripe Customer ID before creation:', customerId);

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
      });
      console.log('Created Stripe Customer:', customer);
      user.stripeCustomerId = customer.id;
      await user.save();
      customerId = customer.id;
    }

    console.log('Final Stripe Customer ID:', customerId);

    // Checkoutセッションの作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    console.log('Created Checkout Session:', session);

    res.json({ id: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Webhook受信エンドポイント
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // イベントタイプに応じた処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // サブスクリプションID取得
    const subscriptionId = session.subscription as string;

    try {
      // サブスクリプション情報取得
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // ユーザー取得
      const customerId = subscription.customer as string;
      const user = await User.findOne({ where: { stripeCustomerId: customerId } });
      if (user) {
        // サブスクリプション情報の保存
        await Subscription.create({
          userId: user.id,
          stripeSubscriptionId: subscription.id,
          plan: subscription.items.data[0].price.nickname, // プラン名
          status: subscription.status,
          startDate: new Date(subscription.start_date * 1000),
          endDate: subscription.cancel_at_period_end ? new Date(subscription.current_period_end * 1000) : null,
        });
      }
    } catch (error) {
      console.error('Error handling checkout.session.completed:', error);
    }
  }

  res.json({ received: true });
});

export default router;
