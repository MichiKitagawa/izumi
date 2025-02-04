// src/components/PdfViewerWithAds.tsx
import React, { useEffect } from 'react';

interface PdfViewerWithAdsProps {
  htmlContent: string;
}

const PdfViewerWithAds: React.FC<PdfViewerWithAdsProps> = ({ htmlContent }) => {
  useEffect(() => {
    if (window.adsbygoogle) {
      window.adsbygoogle.push({});
    }
  }, []);

  return (
    <div>
      {/* 上部バナー広告 */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"  // テスト用IDに置換
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      {/* 下部バナー広告 */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  );
};

export default PdfViewerWithAds;
