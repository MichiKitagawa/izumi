// src/components/ExternalAdManager.tsx
import React, { useEffect } from 'react';

const ExternalAdManager: React.FC = () => {
  useEffect(() => {
    // Google IMA SDK のスクリプト読み込み（動画・音声広告用）
    const imaScript = document.createElement('script');
    imaScript.src = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
    imaScript.async = true;
    imaScript.onload = () => {
      console.log('Google IMA SDK loaded.');
    };
    document.body.appendChild(imaScript);

    // Google AdSense のスクリプト読み込み（バナー広告用、テストモード）
    const adsenseScript = document.createElement('script');
    adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    adsenseScript.async = true;
    adsenseScript.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXX'); // テスト用に適切なIDに置換
    document.body.appendChild(adsenseScript);

    return () => {
      document.body.removeChild(imaScript);
      document.body.removeChild(adsenseScript);
    };
  }, []);

  return null;
};

export default ExternalAdManager;
