// src/components/AdBanner.tsx
import React, { useEffect } from 'react';
import { Typography } from '@mui/material';

const AdBanner: React.FC = () => {
  useEffect(() => {
    if (window.adsbygoogle) {
      window.adsbygoogle.push({});
    }
  }, []);

  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', height: '90px' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"  // テスト用IDに置換
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      <Typography variant="body1" color="textSecondary">
        広告が表示されていません。
      </Typography>
    </div>
  );
};

export default AdBanner;
