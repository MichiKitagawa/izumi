// client/src/components/CheckoutButton.tsx
import { useStripe } from '@stripe/react-stripe-js';
import { API_BASE_URL } from '../api';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext'; // AuthContextのインポート

const CheckoutButton = ({ priceId }: { priceId: string }) => {
  const stripe = useStripe();
  const { token } = useContext(AuthContext); // トークンの取得

  const handleClick = async () => {
    try {
      console.log('Creating checkout session...');
      const response = await fetch(`${API_BASE_URL}/subscription/create-checkout-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Authorizationヘッダーの追加
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const session = await response.json();
      console.log('Checkout session created:', session);

      if (session.id && stripe) {
        await stripe.redirectToCheckout({ sessionId: session.id });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('決済セッションの作成に失敗しました。再度お試しください。');
    }
  };

  return <button onClick={handleClick}>Subscribe</button>;
};

export default CheckoutButton;
