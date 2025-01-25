// client/src/pages/Success.tsx
import  { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Success = () => {
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session_id');
    // sessionIdを使用する場合は処理を追加
    console.log('Session ID:', sessionId);
  }, [location]);
  return <h1>Subscription successful!</h1>;
};

export default Success;
