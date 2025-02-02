// client/src/pages/Subscribe.tsx
import React from 'react';
import CheckoutButton from '../components/CheckoutButton';

const plans = [
  { id: 'price_1Ql4jVQ1huO0LPBMnPdPPF2Y', name: 'Basic Monthly', price: '￥890/month' },
  { id: 'price_XXXX_basic_yearly', name: 'Basic Yearly', price: '￥8900/year' },
  { id: 'price_1Ql4jVQ1huO0LPBMh2bUgjyW', name: 'Pro Monthly', price: '￥1580/month' },
  { id: 'price_XXXX_pro_yearly', name: 'Pro Yearly', price: '￥15800/year' },
  { id: 'price_1Ql4jVQ1huO0LPBM1LS54Czu', name: 'Premium Monthly', price: '￥1980/month' },
  { id: 'price_XXXX_premium_yearly', name: 'Premium Yearly', price: '￥19800/year' },
];

const Subscribe: React.FC = () => (
  <div>
    <h1>Choose Your Plan</h1>
    <div>
      {plans.map(plan => (
        <div key={plan.id}>
          <h2>{plan.name}</h2>
          <p>{plan.price}</p>
          <CheckoutButton priceId={plan.id} />
        </div>
      ))}
    </div>
  </div>
);

export default Subscribe;
