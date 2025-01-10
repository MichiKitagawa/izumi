// src/components/AdBanner.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';

const AdBanner: React.FC = () => {
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await axios.get('/api/ad/');
        setAds(res.data.ads);
      } catch (error) {
        console.error('Failed to fetch ads:', error);
      }
    };

    fetchAds();
  }, []);

  return (
    <div style={{ marginTop: '20px' }}>
      {ads.map((ad) => (
        <Card key={ad.id} style={{ marginBottom: '20px' }} role="region" aria-label="Advertisement">
          {ad.adType === 'video' ? (
            <CardMedia component="video" src={ad.contentUrl} controls aria-label="Advertisement Video" />
          ) : (
            <CardMedia component="img" height="140" image={ad.contentUrl} alt="Ad Banner" />
          )}
          <CardContent>
            <Typography variant="body2" color="textSecondary" component="a" href={ad.targetUrl} target="_blank">
              {ad.targetUrl}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdBanner;
