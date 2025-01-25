import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import React from 'react';


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!); // 修正

const StripeProvider = ({ children }: { children: React.ReactNode }) => {
  return <Elements stripe={stripePromise}>{children}</Elements>;
};

export default StripeProvider;
