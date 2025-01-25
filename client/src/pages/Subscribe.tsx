// client/src/pages/Subscribe.tsx
import CheckoutButton from '../components/CheckoutButton';

const plans = [
  { id: 'price_1Ql4jVQ1huO0LPBMnPdPPF2Y', name: 'Basic', price: '￥890/month' },
  { id: 'price_1Ql4jVQ1huO0LPBMh2bUgjyW', name: 'Pro', price: '￥1580/month' },
  { id: 'price_1Ql4jVQ1huO0LPBM1LS54Czu', name: 'Premium', price: '￥1980/month' },
];

const Subscribe = () => (
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
