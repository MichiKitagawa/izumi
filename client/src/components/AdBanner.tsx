// src/components/AdBanner.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';

const AdBanner: React.FC = () => {
  interface Ad {
    id: string;
    adType: string;
    contentUrl: string;
    targetUrl: string;
  }

  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await axios.get<{ ads: Ad[] }>('/api/ad/');
        if (res.data && Array.isArray(res.data.ads)) {
          setAds(res.data.ads);
        } else {
          console.error('Unexpected API response format:', res.data);
          setAds([]); // デフォルトで空配列を設定
        }
      } catch (error) {
        console.error('Failed to fetch ads:', error);
        setAds([]); // エラー時も空配列を設定
      }
    };

    fetchAds();
  }, []);

  return (
    <div style={{ marginTop: '20px' }}>
      {Array.isArray(ads) && ads.length > 0 ? (
        ads.map((ad) => (
          <Card key={ad.id} style={{ marginBottom: '20px' }} role="region" aria-label="Advertisement">
            {ad.adType === 'video' ? (
              <CardMedia component="video" src={ad.contentUrl} controls aria-label="Advertisement Video" />
            ) : (
              <CardMedia component="img" height="140" image={ad.contentUrl} alt="Ad Banner" />
            )}
            <CardContent>
              <Typography
                variant="body2"
                color="textSecondary"
                component="a"
                href={ad.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ad.targetUrl}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant="body1" color="textSecondary">
          広告が表示されていません。
        </Typography>
      )}
    </div>
  );
};

export default AdBanner;
